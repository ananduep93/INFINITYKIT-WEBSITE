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

export const authService = {
  async loginWithGoogle(): Promise<User> {
    try {
      console.log('Starting Google Sign-In...');
      // In Next.js SSR, we can try signInWithPopup. If it fails, fallback to redirect.
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await this.saveUserProfile(result.user);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', result.user.uid);
        return result.user;
      } catch (popupError: any) {
        console.warn('Popup sign-in failed, attempting redirect...', popupError.code);
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          /Android|iPhone|iPad/i.test(navigator.userAgent)
        ) {
          localStorage.setItem('isLoggedIn', 'loading');
          await signInWithRedirect(auth, googleProvider);
          throw new Error('Redirect initiated');
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  async handleRedirectResult(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        await this.saveUserProfile(result.user);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', result.user.uid);
        return result.user;
      }
    } catch (error) {
      console.error('Redirect result error:', error);
      if (localStorage.getItem('isLoggedIn') === 'loading') {
        localStorage.removeItem('isLoggedIn');
      }
    }
    return null;
  },

  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      await this.saveUserProfile(result.user);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      throw error;
    }
  },

  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await this.saveUserProfile(result.user);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      throw error;
    }
  },

  async loginAnonymously(): Promise<User> {
    try {
      const result = await signInAnonymously(auth);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Anonymous Sign-In Error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      // Clean all local storage tool keys & casing variations to secure user session transition
      const toolKeys = [
        'todolist', 'todos', 'savedPasswords', 'quicknotes', 'quickNotes',
        'infinityKitExpenseDB', 'infinityKitSettings', 'recentTools', 'recentSearches',
        'favorites', 'aichatbot_history', 'passwords', 'notes', 'expenses', 'aiChats'
      ];
      toolKeys.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', user.uid);
      } else {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
      }
      callback(user);
    });
  },

  async saveUserProfile(user: User): Promise<void> {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const profileData: any = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'User',
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
