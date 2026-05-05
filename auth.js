import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithRedirect,
    getRedirectResult,
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth, googleProvider, db, doc, setDoc } from './firebase-config.js';

export const authService = {
    async loginWithGoogle() {
        try {
            console.log("Starting Google Sign-In...");
            
            // Try popup first as it's more reliable on desktop and modern mobile
            try {
                const result = await signInWithPopup(auth, googleProvider);
                console.log("Popup sign-in successful");
                await this.saveUserProfile(result.user);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', result.user.uid);
                return result.user;
            } catch (popupError) {
                console.warn("Popup sign-in failed or was blocked:", popupError.code);
                
                // If popup is blocked or fails, use redirect as fallback
                if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user' || /Android|iPhone|iPad/i.test(navigator.userAgent)) {
                    console.log("Switching to redirect sign-in...");
                    localStorage.setItem('isLoggedIn', 'loading');
                    await signInWithRedirect(auth, googleProvider);
                } else {
                    throw popupError;
                }
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    },

    // Handle the result of a redirect sign-in (call this on app load)
    async handleRedirectResult() {
        try {
            console.log("Checking for redirect result...");
            
            // Add a timeout to getRedirectResult because it can hang if domain is not authorized
            const redirectPromise = getRedirectResult(auth);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Redirect result timeout")), 5000)
            );

            const result = await Promise.race([redirectPromise, timeoutPromise]);
            
            if (result) {
                console.log("Redirect success for user:", result.user.uid);
                await this.saveUserProfile(result.user);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', result.user.uid);
                
                // Determine root path for redirect
                const isToolPage = window.location.pathname.includes('/tools/');
                const target = isToolPage ? '../index.html' : 'index.html';
                console.log("Redirecting to:", target);
                window.location.href = target;
                
                return result.user;
            } else {
                console.log("No redirect result found.");
            }
        } catch (error) {
            console.error("Redirect result error:", error.message);
            // If it timed out, don't block the app
            if (localStorage.getItem('isLoggedIn') === 'loading') {
                localStorage.removeItem('isLoggedIn');
            }
        }
        return null;
    },

    async signUpWithEmail(email, password, name) {
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
            console.error("Email Sign-Up Error:", error);
            throw error;
        }
    },

    async loginWithEmail(email, password) {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await this.saveUserProfile(result.user);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', result.user.uid);
            return result.user;
        } catch (error) {
            console.error("Email Sign-In Error:", error);
            throw error;
        }
    },

    async loginAnonymously() {
        try {
            const result = await signInAnonymously(auth);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', result.user.uid);
            return result.user;
        } catch (error) {
            console.error("Anonymous Sign-In Error:", error);
            throw error;
        }
    },

    async logout() {
        if (!confirm("Are you sure you want to log out? Your local data will be cleared for security.")) {
            return;
        }

        try {
            await signOut(auth);
            
            // Clear local data for privacy
            const toolKeys = ['todos', 'savedPasswords', 'quickNotes', 'infinityKitExpenseDB', 'infinityKitSettings', 'recentTools', 'recentSearches'];
            toolKeys.forEach(key => localStorage.removeItem(key));
            
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userId');
            window.location.href = window.location.pathname.includes('/tools/') ? '../index.html' : 'index.html';
        } catch (error) {
            console.error("Logout failed:", error);
        }
    },

    onAuthChange(callback) {
        onAuthStateChanged(auth, (user) => {
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

    getCurrentUser() {
        return auth.currentUser;
    },

    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    async saveUserProfile(user) {
        if (!user) return;
        try {
            console.log("Saving user profile to Firestore...");
            // Store profile in users/{uid}/profile/info subcollection
            const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
            await setDoc(profileRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Infinity User',
                photoURL: user.photoURL || null,
                lastLogin: new Date().toISOString(),
                version: '1.0',
                platform: 'web'
            }, { merge: true });

            // Also update basic info on root for legacy support/rules
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                lastActive: new Date().toISOString()
            }, { merge: true });

            console.log("User profile saved successfully.");
        } catch (error) {
            console.warn("Non-critical: Error saving user profile to Firestore:", error.message);
        }
    }
};

// Expose to global window for non-module scripts
if (typeof window !== 'undefined') {
    window.authService = authService;
}
