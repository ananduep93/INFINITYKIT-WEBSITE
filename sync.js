import { db, doc, getDoc, setDoc, updateDoc } from './firebase-config.js';
import { authService } from './auth.js';

const DEBOUNCE_DELAY = 1000;
const debounceTimers = {};

export const syncService = {
    async getData(toolName, forceCloud = false) {
        const userId = localStorage.getItem('userId');
        const isLoggedIn = authService.isLoggedIn();
        const localData = localStorage.getItem(toolName);

        // If we have local data and aren't forcing a cloud fetch, return local data immediately (Instant UI)
        if (localData && !forceCloud) {
            return JSON.parse(localData);
        }

        if (isLoggedIn && userId) {
            try {
                const docRef = doc(db, 'users', userId, 'tools', toolName);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const cloudData = docSnap.data().data;
                    localStorage.setItem(toolName, JSON.stringify(cloudData));
                    return cloudData;
                }
            } catch (error) {
                console.error(`Error fetching cloud data for ${toolName}:`, error);
            }
        }

        return localData ? JSON.parse(localData) : null;
    },

    async saveData(toolName, data) {
        const userId = localStorage.getItem('userId');
        const isLoggedIn = authService.isLoggedIn();

        if (isLoggedIn && userId) {
            // Update local cache first (instant responsiveness)
            localStorage.setItem(toolName, JSON.stringify(data));

            // Debounce cloud sync
            if (debounceTimers[toolName]) {
                clearTimeout(debounceTimers[toolName]);
            }

            debounceTimers[toolName] = setTimeout(async () => {
                try {
                    const docRef = doc(db, 'users', userId, 'tools', toolName);
                    await setDoc(docRef, { 
                        data: data,
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                    console.log(`Synced ${toolName} to cloud.`);
                } catch (error) {
                    console.error(`Error syncing ${toolName} to cloud:`, error);
                }
            }, DEBOUNCE_DELAY);
        } else {
            // If not logged in, do NOT save locally.
            // Instead, trigger the sign-in prompt
            window.dispatchEvent(new CustomEvent('showSignInPrompt', { 
                detail: { 
                    title: 'Cloud Sync Required',
                    message: `Please Sign In to save your progress! Your data is currently not being saved.` 
                } 
            }));
            console.warn("Save blocked: User not logged in.");
        }
    },

    async syncLocalToCloud() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        console.log("Starting initial sync (local -> cloud)...");
        
        // List of tool keys to sync (we'll need to expand this or detect them)
        const toolKeys = [
            'todos', 
            'savedPasswords', 
            'quickNotes', 
            'expenses_db', 
            'infinityKitSettings',
            'recentTools',
            'recentSearches'
        ];

        for (const key of toolKeys) {
            const localData = localStorage.getItem(key);
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    const docRef = doc(db, 'users', userId, 'tools', key);
                    
                    // Only upload if cloud data doesn't exist (to honor "Firebase overrides local" rule for subsequent logins)
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) {
                        await setDoc(docRef, { 
                            data: data,
                            updatedAt: new Date().toISOString()
                        });
                        console.log(`Uploaded local data for ${key} to cloud.`);
                    } else {
                        console.log(`Cloud data exists for ${key}, skipping local upload.`);
                    }
                } catch (error) {
                    console.error(`Error syncing ${key} during initial sync:`, error);
                }
            }
        }
    },

    async syncCloudToLocal() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        console.log("Background sync: Fetching latest cloud data...");
        const toolKeys = ['todos', 'savedPasswords', 'quickNotes', 'infinityKitExpenseDB', 'infinityKitSettings', 'recentTools', 'recentSearches'];
        
        for (const key of toolKeys) {
            await this.getData(key, true); // Force cloud fetch to update local cache
        }
        console.log("Background sync complete.");
        
        // Dispatch event so tools can re-render if they want
        window.dispatchEvent(new CustomEvent('infinityKitDataSynced'));
    }
};

// Expose to global window for non-module scripts
if (typeof window !== 'undefined') {
    window.syncService = syncService;
}
