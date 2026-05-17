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
import { auth, googleProvider, db, doc, getDoc, setDoc } from './firebase-config.js';
// SecurityUtils is now loaded as a global script in index.html


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
        if (window.SecurityUtils && !window.SecurityUtils.rateLimit('signup', 3, 300000)) { // 3 attempts / 5 min
            throw new Error("Too many sign-up attempts. Please wait 5 minutes.");
        }
        try {
            const cleanName = window.SecurityUtils ? window.SecurityUtils.sanitize(name) : name;
            const result = await createUserWithEmailAndPassword(auth, email, password);
            if (cleanName) {
                await updateProfile(result.user, { displayName: cleanName });
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
        if (window.SecurityUtils && !window.SecurityUtils.rateLimit('login', 5, 600000)) { // 5 attempts / 10 min
            throw new Error("Too many login attempts. Please wait 10 minutes.");
        }
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
            // Check if user already has a role to avoid overwriting admin status
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            
            const profileData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'User',
                photoURL: user.photoURL || '',
                lastLogin: new Date().toISOString()
            };

            // Only set default role if user document doesn't exist
            if (!userSnap.exists()) {
                profileData.role = 'user';
            }

            await setDoc(userRef, profileData, { merge: true });
            console.log("User profile updated successfully.");
        } catch (error) {
            console.warn("Non-critical: Error saving user profile:", error.message);
        }
    }
};

// Expose to global window for non-module scripts
if (typeof window !== 'undefined') {
    window.authService = authService;
}
