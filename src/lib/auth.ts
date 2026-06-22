import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { supabase } from './supabase';

export interface UnifiedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'firebase' | 'supabase';
}

export const mapFirebaseUserToUnified = (fbUser: User): UnifiedUser => ({
  uid: fbUser.uid,
  email: fbUser.email,
  displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
  photoURL: fbUser.photoURL || '',
  provider: 'firebase'
});

export const mapSupabaseUserToUnified = (sbUser: any): UnifiedUser => ({
  uid: sbUser.id,
  email: sbUser.email || null,
  displayName: sbUser.user_metadata?.display_name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
  photoURL: sbUser.user_metadata?.avatar_url || '',
  provider: 'supabase'
});

export const authService = {
  async syncSupabaseAuth(user: User): Promise<void> {
    if (!user || !user.email) return;
    const email = user.email;
    const derivedPassword = user.uid + '_ik_supabase_coexist';
    
    try {
      console.log('[Auth co-existence] Silently linking Supabase session...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: derivedPassword
      });
      
      if (error) {
        // Sign up if account doesn't exist in Supabase yet
        if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed') || error.message.includes('User not found')) {
          console.log('[Auth co-existence] Registering matching Supabase credentials...');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: derivedPassword,
            options: {
              data: {
                display_name: user.displayName || 'User'
              }
            }
          });
          if (signUpError) {
            console.warn('[Auth co-existence Warning] Supabase silent signup failed:', signUpError.message);
          } else if (signUpData.session) {
            console.log('[Auth co-existence] Supabase silent signup succeeded.');
            localStorage.setItem('supabaseSession', JSON.stringify(signUpData.session));
          }
        } else {
          console.warn('[Auth co-existence Warning] Supabase login failed:', error.message);
        }
      } else if (data.session) {
        console.log('[Auth co-existence] Supabase session synced successfully.');
        localStorage.setItem('supabaseSession', JSON.stringify(data.session));
      }
    } catch (sbErr: any) {
      console.warn('[Auth co-existence Warning] Supabase auth link failed:', sbErr.message || sbErr);
    }
  },

  async loginWithGoogle(): Promise<any> {
    try {
      console.log('[Supabase Auth] Starting Google OAuth Sign-In...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/dashboard?auth=login` 
            : undefined
        }
      });
      if (error) throw error;
      localStorage.setItem('isLoggedIn', 'true');
      return data;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  },

  async handleRedirectResult(): Promise<UnifiedUser | null> {
    if (typeof window === 'undefined') return null;
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        await this.saveUserProfile(result.user);
        await this.syncSupabaseAuth(result.user);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', result.user.uid);
        sessionStorage.setItem('authRedirectSuccess', 'login');
        return mapFirebaseUserToUnified(result.user);
      }
    } catch (error: any) {
      console.error('Redirect result error:', error);
      if (localStorage.getItem('isLoggedIn') === 'loading') {
        localStorage.removeItem('isLoggedIn');
      }
      if (error.code === 'auth/unauthorized-domain') {
        alert("🔒 Firebase Domain Unauthorized:\n\nThe domain '" + window.location.hostname + "' must be added to your Firebase Console under 'Authentication' -> 'Settings' -> 'Authorized Domains'.\n\nGoogle Sign-In will fail on this custom domain until whitelisted!");
      }
    }
    return null;
  },

  async signUpWithEmail(email: string, password: string, name: string): Promise<UnifiedUser> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      await this.saveUserProfile(result.user);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', result.user.uid);

      // Create Supabase Auth account in parallel
      try {
        console.log('[Auth co-existence] Registering user in Supabase Auth...');
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name
            }
          }
        });
      } catch (sbErr: any) {
        console.warn('[Auth co-existence Warning] Supabase automatic registration failed:', sbErr.message);
      }

      return mapFirebaseUserToUnified(result.user);
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      throw error;
    }
  },

  async loginWithEmail(email: string, password: string): Promise<UnifiedUser> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await this.saveUserProfile(result.user);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', result.user.uid);

      // Authenticate with Supabase Auth in parallel
      try {
        console.log('[Auth co-existence] Log in to Supabase Auth...');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // If login fails (e.g. account was created in Firebase prior to Supabase setup), auto-migrate under the hood!
          if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
            console.log('[Auto-Migration] Registering matching Supabase credentials...');
            await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  display_name: result.user.displayName || 'User'
                }
              }
            });
          }
        }
      } catch (sbErr: any) {
        console.warn('[Auth co-existence Warning] Supabase login/auto-migration failed:', sbErr.message);
      }

      return mapFirebaseUserToUnified(result.user);
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      throw error;
    }
  },

  async loginAnonymously(): Promise<UnifiedUser> {
    try {
      const result = await signInAnonymously(auth);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', result.user.uid);
      return mapFirebaseUserToUnified(result.user);
    } catch (error) {
      console.error('Anonymous Sign-In Error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      
      // Logout from Supabase in parallel
      try {
        await supabase.auth.signOut();
      } catch (sbErr: any) {
        console.warn('[Auth co-existence Warning] Supabase logout failed:', sbErr.message);
      }

      // Clean all local storage tool keys & casing variations to secure user session transition
      const toolKeys = [
        'todolist', 'todos', 'savedPasswords', 'quicknotes', 'quickNotes',
        'infinityKitExpenseDB', 'infinityKitSettings', 'recentTools', 'recentSearches',
        'favorites', 'aichatbot_history', 'passwords', 'notes', 'expenses', 'aiChats'
      ];
      toolKeys.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      localStorage.removeItem('supabaseSession');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  onAuthChange(callback: (user: UnifiedUser | null) => void) {
    // 1. Listen to Firebase Auth state
    const unsubscribeFirebase = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', user.uid);
          callback(mapFirebaseUserToUnified(user));
        } else {
          // If logged out from Firebase, check if Supabase still has a session before purging
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('userId', session.user.id);
              callback(mapSupabaseUserToUnified(session.user));
            } else {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('userId');
              callback(null);
            }
          });
        }
      },
      (error) => {
        console.warn('[Firebase Auth state change error caught gracefully]:', error.message || error);
      }
    );

    // 2. Listen to Supabase Auth state change in parallel
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Supabase Auth Event]: ${event}`);
      if (session?.user) {
        localStorage.setItem('supabaseSession', JSON.stringify(session));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', session.user.id);
        callback(mapSupabaseUserToUnified(session.user));
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('supabaseSession');
        // Check if Firebase is still logged in before calling null callback
        const fbUser = auth.currentUser;
        if (fbUser) {
          callback(mapFirebaseUserToUnified(fbUser));
        } else {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userId');
          callback(null);
        }
      }
    });

    return () => {
      unsubscribeFirebase();
      subscription.unsubscribe();
    };
  },

  async resetPassword(email: string): Promise<void> {
    // 1. Try Firebase password reset
    const { sendPasswordResetEmail } = await import('firebase/auth');
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('[Auth co-existence] Firebase password reset email sent.');
    } catch (e: any) {
      console.warn('[Auth co-existence Warning] Firebase password reset failed:', e.message);
    }

    // 2. Try Supabase password reset in parallel
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login?reset=true` : undefined
      });
      if (error) {
        console.warn('[Auth co-existence Warning] Supabase password reset failed:', error.message);
      } else {
        console.log('[Auth co-existence] Supabase password reset email sent.');
      }
    } catch (e: any) {
      console.warn('[Auth co-existence Warning] Supabase password reset error:', e.message || e);
    }
  },

  async updateDisplayName(name: string): Promise<void> {
    // 1. Update Firebase display name if logged in
    const fbUser = auth.currentUser;
    if (fbUser) {
      try {
        await updateProfile(fbUser, { displayName: name });
        await this.saveUserProfile(fbUser);
      } catch (fbErr: any) {
        console.warn('[Firebase Auth] Failed to update display name:', fbErr.message);
      }
    }

    // 2. Update Supabase display name if logged in
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: name }
      });
      if (error) {
        console.warn('[Supabase Auth] Failed to update display name:', error.message);
      } else {
        console.log('[Supabase Auth] Display name updated successfully.');
      }
    } catch (sbErr: any) {
      console.warn('[Supabase Auth] Failed to update display name:', sbErr.message || sbErr);
    }
  },

  async saveUserProfile(user: User): Promise<void> {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const profileData: any = {
        uid: user.uid,
        email: user.email,
        displayName: user.email === 'admin@infinitykit.com' ? 'Admin' : (user.displayName || 'User'),
        photoURL: user.photoURL || '',
        lastLogin: new Date().toISOString()
      };

      if (!userSnap.exists()) {
        profileData.role = 'user';
      }

      await setDoc(userRef, profileData, { merge: true });
    } catch (error: any) {
      console.warn('Error saving profile:', error.message);
    }
  }
};
export default authService;
