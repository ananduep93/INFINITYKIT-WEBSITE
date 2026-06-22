import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './supabase';

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
  passwords: 'passwords',
  ik_vault_v1: 'passwords',
  ik_vault_pin_hash: 'passwords_hash',

  // Daily Planner
  infinitykit_daily_planner: 'dailyPlanner',
  dailyPlanner: 'dailyPlanner',

  // Calendar Events
  infinitykit_calendar_events: 'calendarEvents',
  calendarEvents: 'calendarEvents',

  // Notifications
  infinitykit_notifications: 'notifications',
  notifications: 'notifications',

  // Custom Persona Prompts
  infinitykit_custom_prompts_men: 'customPromptsMen',
  infinitykit_custom_prompts_women: 'customPromptsWomen',

  // Surveys
  infinitykit_surveys: 'surveys',
  surveys: 'surveys',

  // Activity history log
  infinitykit_activity_history: 'activity_history'
};

// Dynamic Auto-Migration & Firestore Reference Resolver
// Dynamic Auto-Migration & Supabase Database Resolver

async function getSupabaseUserId(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem('supabaseSession');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session?.user?.id) return session.user.id;
      } catch (e) {}
    }
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;
  } catch (e) {}
  return null;
}

async function getSupabaseDataAndMigrate(userId: string, toolName: string): Promise<any> {
  const targetCol = PATH_MAP[toolName] || toolName;
  const sbUserId = await getSupabaseUserId();
  
  if (!sbUserId) {
    // If not logged into Supabase, fall back immediately to legacy Firestore
    console.log(`[Auto-Migration] No Supabase session. Querying Firestore directly for "${toolName}"...`);
    const docRef = doc(db, 'users', userId, targetCol, 'data');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().data : null;
  }
  
  try {
    // 1. Check if data exists in Supabase
    const { data: sbData, error: sbError } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', sbUserId)
      .eq('tool_name', targetCol)
      .maybeSingle();

    if (sbError) {
      console.warn('[Sync co-existence Warning] Supabase read failed:', sbError.message);
    }

    if (sbData) {
      return sbData.data;
    }

    // 2. Data does not exist in Supabase. Check legacy Firestore for migration!
    console.log(`[Auto-Migration] Checking Firestore for legacy "${toolName}" data...`);
    const docRef = doc(db, 'users', userId, targetCol, 'data');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const legacyPayload = docSnap.data().data;
      console.log(`[Auto-Migration] Found Firestore data for "${toolName}". Migrating to Supabase user_data...`);

      // Write to Supabase
      const { error: upsertError } = await supabase
        .from('user_data')
        .upsert({
          user_id: sbUserId,
          tool_name: targetCol,
          data: legacyPayload,
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        console.error('[Auto-Migration Error] Failed to write migrated data to Supabase:', upsertError.message);
      } else {
        console.log(`[Auto-Migration] Successfully migrated "${toolName}" data to Supabase!`);
        // Cleanly delete from Firestore so we don't migrate again
        try {
          await deleteDoc(docRef);
        } catch (e) {}
      }

      return legacyPayload;
    }
  } catch (error) {
    console.error(`[Sync co-existence Error] Failed to resolve migration for "${toolName}":`, error);
  }

  return null;
}

export const syncService = {
  async getData(toolName: string, forceCloud = false): Promise<any> {
    if (typeof window === 'undefined') return null;
    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn && userId) {
      try {
        if (forceCloud || !localStorage.getItem(toolName)) {
          const cloudData = await getSupabaseDataAndMigrate(userId, toolName);
          if (cloudData !== null) {
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
        const targetCol = PATH_MAP[toolName] || toolName;
        try {
          // Write to Supabase (primary)
          const sbUserId = await getSupabaseUserId();
          if (sbUserId) {
            const { error: sbError } = await supabase
              .from('user_data')
              .upsert({
                user_id: sbUserId,
                tool_name: targetCol,
                data: data,
                updated_at: new Date().toISOString()
              });

            if (sbError) {
              console.error(`[Supabase Sync Error] Failed to save "${toolName}":`, sbError.message);
            } else {
              console.log(`Synced ${toolName} to Supabase.`);
            }
          }

          // Write to Firebase Firestore temporarily (dual sync / backup coexistence!)
          try {
            const docRef = doc(db, 'users', userId, targetCol, 'data');
            await setDoc(docRef, {
              data: data,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } catch (fbErr: any) {
            console.warn('[Firestore Coexistence Sync Warning]:', fbErr.message);
          }
        } catch (error) {
          console.error(`Error syncing ${toolName} to cloud:`, error);
        }
      }, DEBOUNCE_DELAY);
    } else {
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
      const sbUserId = await getSupabaseUserId();
      if (isFavorite) {
        // Save to Supabase (primary)
        if (sbUserId) {
          await supabase
            .from('user_favorites')
            .upsert({
              user_id: sbUserId,
              tool_id: toolId,
              saved_at: new Date().toISOString()
            });
        }
        
        // Save to Firebase (coexistence)
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          const favRef = doc(db, 'users', userId, 'favorites', toolId);
          await setDoc(favRef, { toolId, savedAt: new Date().toISOString() });
        } catch (e) {}
      } else {
        // Delete from Supabase
        if (sbUserId) {
          await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', sbUserId)
            .eq('tool_id', toolId);
        }
          
        // Delete from Firebase
        try {
          const { doc, deleteDoc } = await import('firebase/firestore');
          const favRef = doc(db, 'users', userId, 'favorites', toolId);
          await deleteDoc(favRef);
        } catch (e) {}
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
      const sbUserId = await getSupabaseUserId();
      if (sbUserId) {
        // Fetch from Supabase (primary)
        const { data, error } = await supabase
          .from('user_favorites')
          .select('tool_id')
          .eq('user_id', sbUserId);
          
        if (!error && data) {
          return data.map(item => item.tool_id);
        }
      }
      
      // Fallback/Coexistence to Firebase
      const { collection, getDocs } = await import('firebase/firestore');
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
      const sbUserId = await getSupabaseUserId();
      if (sbUserId) {
        // Save to Supabase (primary)
        await supabase
          .from('tool_usage')
          .upsert({
            user_id: sbUserId,
            tool_id: toolId,
            last_accessed: new Date().toISOString()
          });
      }

      // Save to Firebase (coexistence)
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const historyRef = doc(db, 'users', userId, 'history', toolId);
        await setDoc(historyRef, {
          toolId,
          lastAccessed: new Date().toISOString()
        });
      } catch (e) {}
    } catch (error) {
      console.error('Error syncing history:', error);
    }
  },

  async syncLocalToCloud(): Promise<void> {
    if (typeof window === 'undefined') return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    console.log('Starting local -> cloud sync...');
    const sbUserId = await getSupabaseUserId();
    const toolKeys = [
      'todolist', 'todos', 'savedPasswords', 'quicknotes', 'quickNotes',
      'infinityKitExpenseDB', 'infinityKitSettings', 'recentSearches',
      'budget', 'dailyPlanner', 'medreminders', 'medicineReminders',
      'reminderAlerts', 'examMarks', 'aichatbot_history',
      'infinitykit_daily_planner', 'infinitykit_calendar_events',
      'infinitykit_notifications', 'ik_vault_v1', 'ik_vault_pin_hash',
      'infinitykit_custom_prompts_men', 'infinitykit_custom_prompts_women',
      'infinitykit_surveys', 'infinitykit_activity_history'
    ];

    for (const key of toolKeys) {
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const data = JSON.parse(localData);
          const targetCol = PATH_MAP[key] || key;
          
          // Upsert in Supabase
          if (sbUserId) {
            await supabase
              .from('user_data')
              .upsert({
                user_id: sbUserId,
                tool_name: targetCol,
                data: data,
                updated_at: new Date().toISOString()
              });
          }

          // Coexistence: also write to Firestore
          try {
            const { doc, getDoc, setDoc } = await import('firebase/firestore');
            const docRef = doc(db, 'users', userId, targetCol, 'data');
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
              await setDoc(docRef, { data, updatedAt: new Date().toISOString() });
            }
          } catch (e) {}
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
    const sbUserId = await getSupabaseUserId();
    const toolKeys = [
      'todolist', 'todos', 'savedPasswords', 'quicknotes', 'quickNotes',
      'infinityKitExpenseDB', 'infinityKitSettings', 'recentSearches',
      'budget', 'dailyPlanner', 'medreminders', 'medicineReminders',
      'reminderAlerts', 'examMarks', 'aichatbot_history',
      'infinitykit_daily_planner', 'infinitykit_calendar_events',
      'infinitykit_notifications', 'ik_vault_v1', 'ik_vault_pin_hash',
      'infinitykit_custom_prompts_men', 'infinitykit_custom_prompts_women',
      'infinitykit_surveys', 'infinitykit_activity_history'
    ];

    for (const key of toolKeys) {
      await this.getData(key, true);
    }

    const cloudFavs = await this.getFavorites();
    localStorage.setItem('favorites', JSON.stringify(cloudFavs));

    // History sync from Supabase
    try {
      if (sbUserId) {
        const { data, error } = await supabase
          .from('tool_usage')
          .select('tool_id, last_accessed')
          .eq('user_id', sbUserId)
          .order('last_accessed', { ascending: false })
          .limit(15);

        if (!error && data) {
          const history = data.map(item => ({
            id: item.tool_id,
            name: item.tool_id,
            time: item.last_accessed
          }));
          localStorage.setItem('recentTools', JSON.stringify(history));
          console.log('Background sync complete.');
          window.dispatchEvent(new CustomEvent('infinityKitDataSynced'));
          return;
        }
      }

      // Fallback to Firestore
      const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
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
  },

  async logActivity(toolName: string, actionDescription: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('infinitykit_activity_history');
      let history = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(history)) history = [];

      const newActivity = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: toolName,
        time: 'Just now', // Standard fallback
        timestamp: new Date().toISOString(),
        action: actionDescription
      };

      // Keep only last 50 activities
      history = [newActivity, ...history].slice(0, 50);

      // Save using syncService.saveData to write to localStorage and Supabase!
      await this.saveData('infinitykit_activity_history', history);
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  }
};

export default syncService;
