import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../lib/sync';

export function useSync(toolKey?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(!!toolKey);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!toolKey) return;
    setLoading(true);
    try {
      const result = await syncService.getData(toolKey);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [toolKey]);

  const saveData = useCallback(async (newData: any) => {
    if (!toolKey) return;
    setData(newData);
    await syncService.saveData(toolKey, newData);
  }, [toolKey]);

  const loadFavoritesAndRecents = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const favs = await syncService.getFavorites();
      setFavorites(favs);
      
      const recents = JSON.parse(localStorage.getItem('recentTools') || '[]');
      setRecentTools(recents);
    } catch (e) {}
  }, []);

  const toggleFavorite = useCallback(async (toolId: string) => {
    const isFav = favorites.includes(toolId);
    let nextFavs = [...favorites];
    if (isFav) {
      nextFavs = nextFavs.filter(id => id !== toolId);
    } else {
      nextFavs.push(toolId);
    }
    setFavorites(nextFavs);
    localStorage.setItem('favorites', JSON.stringify(nextFavs));
    await syncService.saveFavorite(toolId, !isFav);
  }, [favorites]);

  const addRecent = useCallback(async (toolId: string, name: string) => {
    if (typeof window === 'undefined') return;
    let recents = JSON.parse(localStorage.getItem('recentTools') || '[]');
    recents = recents.filter((t: any) => (typeof t === 'string' ? t : t.id) !== toolId);
    recents.unshift({ id: toolId, name, time: Date.now() });
    recents = recents.slice(0, 10);
    localStorage.setItem('recentTools', JSON.stringify(recents));
    setRecentTools(recents);
    await syncService.addToHistory(toolId);
  }, []);

  useEffect(() => {
    loadData();
    loadFavoritesAndRecents();

    const handleSync = () => {
      loadData();
      loadFavoritesAndRecents();
    };

    window.addEventListener('infinityKitDataSynced', handleSync);
    return () => window.removeEventListener('infinityKitDataSynced', handleSync);
  }, [loadData, loadFavoritesAndRecents]);

  return {
    data,
    loading,
    saveData,
    favorites,
    recentTools,
    toggleFavorite,
    addRecent,
    refetch: loadData
  };
}
export default useSync;
