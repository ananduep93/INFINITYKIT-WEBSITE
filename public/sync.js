import { db, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, orderBy, limit } from './firebase-config.js';
import { authService } from './auth.js';

const DEBOUNCE_DELAY = 1000;
const debounceTimers = {};

export const syncService = {
    // Standard data sync (for tool-specific data like todos, settings)
    async getData(toolName, forceCloud = false) {
        const userId = localStorage.getItem('userId');
        const isLoggedIn = authService.isLoggedIn();

        if (isLoggedIn && userId) {
            try {
                // If not forced, we can check if we have local data first for speed, 
                // but for parity we should really check the cloud if we're in a "sync" context.
                // For now, let's always fetch if forceCloud is true OR if we want to ensure latest.
                if (forceCloud || !localStorage.getItem(toolName)) {
                    const docRef = doc(db, 'users', userId, 'tools', toolName);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        const cloudData = docSnap.data().data;
                        localStorage.setItem(toolName, JSON.stringify(cloudData));
                        return cloudData;
                    }
                }
            } catch (error) {
                console.error(`Error fetching cloud data for ${toolName}:`, error);
            }
        }

        const localData = localStorage.getItem(toolName);
        return localData ? JSON.parse(localData) : null;
    },

    async saveData(toolName, data) {
        const userId = localStorage.getItem('userId');
        const isLoggedIn = authService.isLoggedIn();

        if (isLoggedIn && userId) {
            localStorage.setItem(toolName, JSON.stringify(data));

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
            window.dispatchEvent(new CustomEvent('showSignInPrompt', { 
                detail: { 
                    title: 'Cloud Sync Required',
                    message: `Please Sign In to save your progress! Your data is currently not being saved.` 
                } 
            }));
        }
    },

    // Unified Favorites Sync (Parity with Mobile)
    async saveFavorite(toolId, isFavorite) {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            const favRef = doc(db, 'users', userId, 'favorites', toolId);
            if (isFavorite) {
                await setDoc(favRef, {
                    toolId: toolId,
                    savedAt: new Date().toISOString()
                });
            } else {
                await deleteDoc(favRef);
            }
            console.log(`Favorite ${isFavorite ? 'saved' : 'removed'}: ${toolId}`);
        } catch (error) {
            console.error("Error syncing favorite:", error);
        }
    },

    async getFavorites() {
        const userId = localStorage.getItem('userId');
        if (!userId) return [];

        try {
            const favsCol = collection(db, 'users', userId, 'favorites');
            const snapshot = await getDocs(favsCol);
            return snapshot.docs.map(doc => doc.id);
        } catch (error) {
            console.error("Error fetching favorites:", error);
            return [];
        }
    },

    // Unified History Sync (Parity with Mobile)
    async addToHistory(toolId) {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            const historyRef = doc(db, 'users', userId, 'history', toolId);
            await setDoc(historyRef, {
                toolId: toolId,
                lastAccessed: new Date().toISOString()
            });
            console.log(`History updated: ${toolId}`);
        } catch (error) {
            console.error("Error syncing history:", error);
        }
    },

    async syncLocalToCloud() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        console.log("Starting initial sync (local -> cloud)...");
        
        // 1. Sync standard tool data
        const toolKeys = [
            'todos', 'savedPasswords', 'quickNotes', 'infinityKitExpenseDB', 
            'infinityKitSettings', 'recentSearches', 'budget', 'dailyPlanner', 
            'medicineReminders', 'reminderAlerts', 'examMarks'
        ];
        for (const key of toolKeys) {
            const localData = localStorage.getItem(key);
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    const docRef = doc(db, 'users', userId, 'tools', key);
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) {
                        await setDoc(docRef, { data: data, updatedAt: new Date().toISOString() });
                    }
                } catch (e) {}
            }
        }

        // 2. Sync Favorites (Array to Collection migration)
        try {
            const localFavs = JSON.parse(localStorage.getItem('favorites')) || [];
            for (const toolId of localFavs) {
                await this.saveFavorite(toolId, true);
            }
        } catch (e) {}

        // 3. Sync Recent Tools (Array to Collection migration)
        try {
            const localRecent = JSON.parse(localStorage.getItem('recentTools')) || [];
            for (const tool of localRecent) {
                const id = typeof tool === 'string' ? tool : tool.id;
                await this.addToHistory(id);
            }
        } catch (e) {}
    },

    async syncCloudToLocal() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        console.log("Background sync: Fetching latest cloud data...");
        
        // Sync tools
        const toolKeys = [
            'todos', 'savedPasswords', 'quickNotes', 'infinityKitExpenseDB', 
            'infinityKitSettings', 'recentSearches', 'budget', 'dailyPlanner', 
            'medicineReminders', 'reminderAlerts', 'examMarks'
        ];
        for (const key of toolKeys) {
            await this.getData(key, true);
        }

        // Sync Favorites
        const cloudFavs = await this.getFavorites();
        localStorage.setItem('favorites', JSON.stringify(cloudFavs));

        // Sync History (Recent Tools)
        try {
            const historyCol = collection(db, 'users', userId, 'history');
            const q = query(historyCol, orderBy('lastAccessed', 'desc'), limit(15));
            const snapshot = await getDocs(q);
            const history = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.id, 
                time: doc.data().lastAccessed
            }));
            localStorage.setItem('recentTools', JSON.stringify(history));
        } catch (e) {
            console.warn("History sync failed:", e);
        }

        console.log("Background sync complete.");
        window.dispatchEvent(new CustomEvent('infinityKitDataSynced'));
    }
};

// Expose to global window for non-module scripts
if (typeof window !== 'undefined') {
    window.syncService = syncService;
}
