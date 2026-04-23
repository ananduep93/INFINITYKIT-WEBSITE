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
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', result.user.uid);
                return result.user;
            } catch (popupError) {
                // If popup is blocked or it's mobile, use redirect
                console.log("Popup failed or mobile detected, switching to redirect...");
                localStorage.setItem('isLoggedIn', 'loading');
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
            console.log("Checking for redirect result...");
            const result = await getRedirectResult(auth);
            if (result) {
                console.log("Redirect success for user:", result.user.uid);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', result.user.uid);
                
                // Determine root path for redirect
                const isToolPage = window.location.pathname.includes('/tools/');
                const target = isToolPage ? '../index.html' : 'index.html';
                console.log("Redirecting to:", target);
                window.location.href = target;
                
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
    }
};

// Expose to global window for non-module scripts
if (typeof window !== 'undefined') {
    window.authService = authService;
}
