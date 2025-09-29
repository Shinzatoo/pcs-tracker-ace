import { useState, useEffect } from 'react';

export interface FavoriteMessage {
  id: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
}

export function useFavoriteMessages() {
  const [favoriteMessages, setFavoriteMessages] = useState<FavoriteMessage[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('favorite-messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setFavoriteMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading favorite messages:', error);
      }
    }
  }, []);

  // Save to localStorage whenever favoriteMessages changes
  useEffect(() => {
    localStorage.setItem('favorite-messages', JSON.stringify(favoriteMessages));
  }, [favoriteMessages]);

  const addFavoriteMessage = (message: FavoriteMessage) => {
    setFavoriteMessages(prev => {
      // Check if message already exists
      const exists = prev.some(fav => fav.id === message.id);
      if (exists) return prev;
      
      return [...prev, message];
    });
  };

  const removeFavoriteMessage = (messageId: string) => {
    setFavoriteMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const isFavorite = (messageId: string) => {
    return favoriteMessages.some(msg => msg.id === messageId);
  };

  const favoritesCount = favoriteMessages.length;

  return {
    favoriteMessages,
    addFavoriteMessage,
    removeFavoriteMessage,
    isFavorite,
    favoritesCount
  };
}