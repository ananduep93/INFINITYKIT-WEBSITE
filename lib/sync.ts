import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

const DEBOUNCE_DELAY = 1000;
const debounceTimers: Record<string, NodeJS.Timeout> = {};

// Unified Casing & Path Mapping Dictionary
export const PATH_MAP: Record<string, string> = {
  // Notes
  quicknotes: 'notes',
  quickNotes: 'notes',
  notes: 'notes',

  // Todos
  todolist: 'todos',
  todos: 'todos',

  // Expenses
  infinityKitExpenseDB: 'expenses',
  expenses: 'expenses',

  // Settings
  infinityKitSettings: 'settings',
  settings: 'settings',

  // AI Chats
  aichatbot_history: 'aiChats',
  aiChats: 'aiChats',

  // Passwords
  savedPasswords: 'passwords',
  passwords: 'passwords'
};

// Dynamic Auto-Migration & Firestore Reference Resolver
async function getFirestoreRefAndMigrate(userId: string, toolName: string) {
  const targetCol = PATH_MAP[toolName];
  
  if (!targetCol) {
    // Default fallback path for dynamic unmapped tools
    return doc(db, 'users', userId, 'tools', toolName);
  }

  const newDocRef = doc(db, 'users', userId, targetCol, 'data');
  
  try {
    const newDocSnap = await getDoc(newDocRef);
    if (newDocSnap.exists()) {
      // New path exists, use it immediately
      return newDocRef;
    }

    // New path does NOT exist. Search for legacy documents to migrate
    const legacyKeys = Object.keys(PATH_MAP).filter(k => PATH_MAP[k] === targetCol);
    let migratedPayload: any = null;
    let foundLegacyRef = null;

    for (const legacyKey of legacyKeys) {
      const legacyRef = doc(db, 'users', userId, 'tools', legacyKey);
      const legacySnap = await getDoc(legacyRef);
      if (legacySnap.exists()) {
        migratedPayload = legacySnap.data().data;
        foundLegacyRef = legacyRef;
        break;
      }
    }

    if (migratedPayload !== null) {
      console.log(`[Auto-Migration] Found legacy user data for "${toolName}". Restoring to subcollection "${targetCol}"...`);
      // 1. Write legacy payload to the new path
      await setDoc(newDocRef, {
        data: migratedPayload,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 2. Cleanly purge the legacy document to finalize migration
      if (foundLegacyRef) {
        try {
          await deleteDoc(foundLegacyRef);
          console.log(`[Auto-Migration] Cleanly deleted legacy document for "${toolName}".`);
        } catch (e) {
          console.warn('[Auto-Migration Warning] Could not delete legacy document:', e);
        }
      }
    }
  } catch (error) {
    console.error(`[Auto-Migration Error] Failed to resolve migration check for "${toolName}":`, error);
  }

  return newDocRef;
}

export const syncService = {
  async getData(toolName: string, forceCloud = false): Promise<any> {
    if (typeof window === 'undefined') return null;
    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn && userId) {
      try {
        if (forceCloud || !localStorage.getItem(toolName)) {
          const docRef = await getFirestoreRefAndMigrate(userId, toolName);
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

  async saveData(toolName: string, data: any): Promise<void> {
    if (typeof window === 'undefined') return;
    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Store locally first
    localStorage.setItem(toolName, JSON.stringify(data));

    if (isLoggedIn && userId) {
      if (debounceTimers[toolName]) {
        clearTimeout(debounceTimers[toolName]);
      }

      debounceTimers[toolName] = setTimeout(async () => {
        try {
          const docRef = await getFirestoreRefAndMigrate(userId, toolName);
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
      // Dispatches custom event for the app view to notice
      window.dispatchEvent(new CustomEvent('showSignInPrompt', {
        detail: {
          title: 'Cloud Sync Disabled',
          message: 'Sign in to back up your progress across devices!'
        }
      }));
    }
  },

  async saveFavorite(toolId: string, isFavorite: boolean): Promise<void> {
    if (typeof window === 'undefined') return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const favRef = doc(db, 'users', userId, 'favorites', toolId);
      if (isFavorite) {
        await setDoc(favRef, {
          toolId,
          savedAt: new Date().toISOString()
        });
      } else {
        await deleteDoc(favRef);
      }
    } catch (error) {
      console.error('Error syncing favorite:', error);
    }
  },

  async getFavorites(): Promise<string[]> {
    if (typeof window === 'undefined') return [];
    const userId = localStorage.getItem('userId');
    if (!userId) return [];

    try {
      const favsCol = collection(db, 'users', userId, 'favorites');
      const snapshot = await getDocs(favsCol);
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },

  async addToHistory(toolId: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const historyRef = doc(db, 'users', userId, 'history', toolId);
      await setDoc(historyRef, {
        toolId,
        lastAccessed: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing history:', error);
    }
  },

  async syncLocalToCloud(): Promise<void> {
    if (typeof window === 'undefined') return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    console.log('Starting local -> cloud sync...');
    const toolKeys = [
      'todolist', 'todos', 'savedPasswords', 'quicknotes', 'quickNotes',
      'infinityKitExpenseDB', 'infinityKitSettings', 'recentSearches',
      'budget', 'dailyPlanner', 'medreminders', 'medicineReminders',
      'reminderAlerts', 'examMarks', 'aichatbot_history'
    ];

    for (const key of toolKeys) {
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const data = JSON.parse(localData);
          const docRef = await getFirestoreRefAndMigrate(userId, key);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            await setDoc(docRef, { data, updatedAt: new Date().toISOString() });
          }
        } catch (e) {}
      }
    }

    // Favorites
    try {
      const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
      for (const toolId of localFavs) {
        await this.saveFavorite(toolId, true);
      }
    } catch (e) {}
  },

  async syncCloudToLocal(): Promise<void> {
    if (typeof window === 'undefined') return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    console.log('Starting cloud -> local sync...');
    const toolKeys = [
      'todolist', 'todos', 'savedPasswords', 'quicknotes', 'quickNotes',
      'infinityKitExpenseDB', 'infinityKitSettings', 'recentSearches',
      'budget', 'dailyPlanner', 'medreminders', 'medicineReminders',
      'reminderAlerts', 'examMarks', 'aichatbot_history'
    ];

    for (const key of toolKeys) {
      await this.getData(key, true);
    }

    const cloudFavs = await this.getFavorites();
    localStorage.setItem('favorites', JSON.stringify(cloudFavs));

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
      console.warn('History sync failed:', e);
    }

    console.log('Background sync complete.');
    window.dispatchEvent(new CustomEvent('infinityKitDataSynced'));
  }
};
export default syncService;
