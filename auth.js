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
import { auth, googleProvider } from './firebase-config.js';

export const authService = {
    async loginWithGoogle() {
        try {
            // Check if user is on a mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Try popup first (best UX if not blocked)
            try {
                if (isMobile) throw new Error("Force redirect on mobile"); // Direct to redirect for mobile
                
                const result = await signInWithPopup(auth, googleProvider);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userId', result.user.uid);
                return result.user;
            } catch (popupError) {
                // If popup is blocked or it's mobile, use redirect
                console.log("Popup failed or mobile detected, switching to redirect...");
                await signInWithRedirect(auth, googleProvider);
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    },

    // Handle the result of a redirect sign-in (call this on app load)
    async handleRedirectResult() {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userId', result.user.uid);
                
                // Determine root path for redirect
                const isToolPage = window.location.pathname.includes('/tools/');
                window.location.href = isToolPage ? '../index.html' : 'index.html';
                
                return result.user;
            }
        } catch (error) {
            console.error("Redirect result error:", error);
        }
        return null;
    },

    async signUpWithEmail(email, password, name) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            if (name) {
                await updateProfile(result.user, { displayName: name });
            }
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userId', result.user.uid);
            return result.user;
        } catch (error) {
            console.error("Email Sign-Up Error:", error);
            throw error;
        }
    },

    async loginWithEmail(email, password) {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userId', result.user.uid);
            return result.user;
        } catch (error) {
            console.error("Email Sign-In Error:", error);
            throw error;
        }
    },

    async loginAnonymously() {
        try {
            const result = await signInAnonymously(auth);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userId', result.user.uid);
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
            
            // Clear local data for privacy (Optionally keep infinityKitStats if you want global stats)
            const toolKeys = ['todos', 'savedPasswords', 'quickNotes', 'infinityKitExpenseDB', 'infinityKitSettings', 'recentTools', 'recentSearches'];
            toolKeys.forEach(key => localStorage.removeItem(key));
            
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userId');
            window.location.href = '/index.html';
        } catch (error) {
            console.error("Logout failed:", error);
        }
    },

    onAuthChange(callback) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userId', user.uid);
            } else {
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('userId');
            }
            callback(user);
        });
    },

    getCurrentUser() {
        return auth.currentUser;
    },

    isLoggedIn() {
        return sessionStorage.getItem('isLoggedIn') === 'true';
    }
};

// Expose to global window for non-module scripts
if (typeof window !== 'undefined') {
    window.authService = authService;
}
