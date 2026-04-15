import { auth, db, googleProvider } from "./firebase-init.js";
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const AuthHandler = {
    user: null,
    isMigrating: false,

    async init() {
        onAuthStateChanged(auth, async (user) => {
            this.user = user;
            if (user) {
                console.log("User logged in:", user.uid);
                await this.handleUserSession(user);
                this.updateUI(true);
            } else {
                console.log("User logged out");
                this.updateUI(false);
            }
            // Dispatch event for other modules
            window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user } }));
        });
    },

    async login() {
        try {
            await signInWithPopup(auth, googleProvider);
            showToast("Logged in successfully!", "success");
        } catch (error) {
            console.error("Login failed:", error);
            let msg = "Login failed. ";
            if (error.code === 'auth/popup-blocked') {
                msg += "Popup was blocked by your browser.";
            } else if (error.code === 'auth/operation-not-allowed') {
                msg += "Google Sign-In is not enabled in Firebase Console.";
            } else if (error.code === 'auth/unauthorized-domain') {
                msg += "Domain not authorized in Firebase Console.";
            } else {
                msg += error.code || "Please try again.";
            }
            showToast(msg, "error");
        }
    },

    async logout() {
        try {
            await signOut(auth);
            showToast("Logged out successfully.", "info");
            // Note: We don't clear local storage here as per requirements (keep as fallback)
            window.location.reload(); // Reload to reset state
        } catch (error) {
            console.error("Logout failed:", error);
        }
    },

    async handleUserSession(user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() || !userDoc.data().isMigrated) {
            await this.migrateLocalData(user);
        } else {
            await this.syncDown(user);
        }
    },

    async migrateLocalData(user) {
        console.log("Starting data migration...");
        this.isMigrating = true;
        showToast("Syncing your data...", "info");

        try {
            // 1. Read LocalStorage
            const settings = JSON.parse(localStorage.getItem('infinityKitSettings')) || {};
            const expenses = JSON.parse(localStorage.getItem('infinityKitExpenseDB')) || { expenses: [], budgets: {} };
            const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
            
            // 2. Read IndexedDB (Reminders)
            let alerts = [];
            try {
                alerts = await this.readIndexedDBAlerts();
            } catch (e) {
                console.warn("Failed to read IDB alerts during migration:", e);
            }

            // 3. Prepare Firestore Data
            const migrationData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                lastLogin: Date.now(),
                isMigrated: true,
                preferences: {
                    theme: settings.theme || 'light',
                    fontSize: settings.fontSize || 'medium',
                    cardSize: settings.cardSize || 'normal',
                    animationsEnabled: settings.animationsEnabled !== false,
                    notif_sound: localStorage.getItem('notif_sound') || 'on'
                },
                favorites: settings.favorites || [],
                toolData: {
                    expenses: expenses,
                    alerts: alerts,
                    recentTools: settings.recentTools || [],
                    usageStats: settings.usageStats || {},
                    recentSearches: recentSearches
                }
            };

            // 4. Upload to Firestore
            await setDoc(doc(db, "users", user.uid), migrationData);
            console.log("Migration completed successfully.");
            showToast("Migration complete! Data synced to cloud.", "success");
        } catch (error) {
            console.error("Migration failed:", error);
            showToast("Data sync failed. Using local data.", "error");
        } finally {
            this.isMigrating = false;
        }
    },

    async syncDown(user) {
        console.log("Syncing data from cloud...");
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                
                // Update Local Storage (Sync Down)
                const settings = {
                    theme: data.preferences?.theme,
                    fontSize: data.preferences?.fontSize,
                    cardSize: data.preferences?.cardSize,
                    animationsEnabled: data.preferences?.animationsEnabled,
                    favorites: data.favorites || [],
                    recentTools: data.toolData?.recentTools || [],
                    usageStats: data.toolData?.usageStats || {}
                };
                
                localStorage.setItem('infinityKitSettings', JSON.stringify(settings));
                if (data.toolData?.expenses) {
                    localStorage.setItem('infinityKitExpenseDB', JSON.stringify(data.toolData.expenses));
                }
                if (data.toolData?.recentSearches) {
                    localStorage.setItem('recentSearches', JSON.stringify(data.toolData.recentSearches));
                }
                if (data.preferences?.notif_sound) {
                    localStorage.setItem('notif_sound', data.preferences.notif_sound);
                }

                // Note: We don't overwrite IDB immediately here to avoid conflicts, 
                // but we could implement an alert sync too.
                
                // Refresh App State (calls loadSettings and applySettings)
                if (typeof window.loadSettings === 'function') window.loadSettings();
                if (typeof window.applySettings === 'function') window.applySettings();
                
                // Trigger events for tools to reload
                window.dispatchEvent(new Event('infinityKitExpenseDataChanged'));
            }
        } catch (error) {
            console.error("Sync down failed:", error);
        }
    },

    async syncUp(field, value) {
        if (!this.user) return;
        try {
            const userDocRef = doc(db, "users", this.user.uid);
            await updateDoc(userDocRef, {
                [field]: value,
                lastUpdated: Date.now()
            });
        } catch (error) {
            console.error(`Sync up failed for ${field}:`, error);
        }
    },

    readIndexedDBAlerts() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('InfinityKitAlerts', 1);
            request.onerror = () => reject('IDB Access Denied');
            request.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('alerts')) {
                    resolve([]);
                    return;
                }
                const tx = db.transaction('alerts', 'readonly');
                const store = tx.objectStore('alerts');
                const getReq = store.getAll();
                getReq.onsuccess = () => resolve(getReq.result);
                getReq.onerror = () => reject('Failed to read alerts');
            };
        });
    },

    updateUI(isLoggedIn) {
        const navRight = document.getElementById('navRight');
        const accountSection = document.getElementById('accountSection');
        if (!navRight) return;

        let userProfile = document.getElementById('userProfile');
        
        if (isLoggedIn) {
            if (accountSection) accountSection.style.display = 'block';
            const photoURL = this.user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
            if (!userProfile) {
                userProfile = document.createElement('div');
                userProfile.id = 'userProfile';
                userProfile.className = 'user-profile-container';
                navRight.appendChild(userProfile);
            }
            userProfile.innerHTML = `
                <div class="user-avatar" onclick="AuthHandler.toggleUserMenu()">
                    <img src="${photoURL}" alt="User" onerror="this.src='https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'">
                </div>
                <div id="userMenu" class="user-menu">
                    <div class="user-info">
                        <span class="user-name">${this.user.displayName}</span>
                        <span class="user-email">${this.user.email}</span>
                    </div>
                    <hr>
                    <button onclick="AuthHandler.logout()" class="logout-btn">Logout</button>
                    <div class="sync-status">Cloud Sync Active ☁️</div>
                </div>
            `;
            // Remove login btn if exists
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) loginBtn.remove();
        } else {
            if (accountSection) accountSection.style.display = 'none';
            if (userProfile) userProfile.remove();
            if (!document.getElementById('loginBtn')) {
                const loginBtn = document.createElement('button');
                loginBtn.id = 'loginBtn';
                loginBtn.className = 'login-btn';
                loginBtn.innerHTML = 'Login';
                loginBtn.onclick = () => this.login();
                navRight.insertBefore(loginBtn, document.getElementById('settingsBtn'));
            }
        }
    },

    toggleUserMenu() {
        const menu = document.getElementById('userMenu');
        if (menu) menu.classList.toggle('show');
    }
};

// Expose to window for inline onclick handlers
window.AuthHandler = AuthHandler;
AuthHandler.init();

export default AuthHandler;
