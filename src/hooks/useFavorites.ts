import { useState, useEffect, useCallback } from 'react';
import { Vessel } from '@/lib/api';

const FAVORITES_KEY = 'pcs:favorites';

export interface FavoriteVessel {
  id: string;
  vessel_id: string;
  title: string;
  status: string;
  updatedAt: string;
  source?: string;
  addedAt: string;
}

/**
 * Hook for managing favorite vessels with localStorage persistence
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteVessel[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    }
  }, [favorites, loading]);

  // Check if vessel is favorited
  const isFavorite = useCallback((vesselId: string) => {
    return favorites.some(fav => fav.vessel_id === vesselId);
  }, [favorites]);

  // Add vessel to favorites
  const addFavorite = useCallback((vessel: Vessel) => {
    const favoriteData: FavoriteVessel = {
      id: crypto.randomUUID(),
      vessel_id: vessel.vessel_id,
      title: vessel.vessel_id, // Could be enhanced with actual vessel name
      status: vessel.statusResumo,
      updatedAt: new Date().toISOString(),
      source: vessel.agency?.nomeAgencia || vessel.terminal?.terminal || 'PCS',
      addedAt: new Date().toISOString(),
    };

    setFavorites(prev => {
      // Prevent duplicates
      if (prev.some(fav => fav.vessel_id === vessel.vessel_id)) {
        return prev;
      }
      return [favoriteData, ...prev];
    });
  }, []);

  // Remove vessel from favorites
  const removeFavorite = useCallback((vesselId: string) => {
    setFavorites(prev => prev.filter(fav => fav.vessel_id !== vesselId));
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((vessel: Vessel) => {
    if (isFavorite(vessel.vessel_id)) {
      removeFavorite(vessel.vessel_id);
    } else {
      addFavorite(vessel);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  // Get favorites list
  const getFavorites = useCallback(() => {
    return [...favorites].sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, [favorites]);

  // Get favorites count
  const favoritesCount = favorites.length;

  return {
    favorites: getFavorites(),
    favoritesCount,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
  };
}