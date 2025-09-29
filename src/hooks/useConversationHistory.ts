import { useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const STORAGE_KEY = 'agente-maritimo-conversation';

export const useConversationHistory = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
    
    // Default welcome message
    return [{
      id: "welcome",
      text: "Olá! Sou o Agente Marítimo IA. Posso ajudá-lo com informações sobre o status dos navios e operações portuárias. Como posso ajudar?",
      isUser: false,
      timestamp: new Date()
    }];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }, [messages]);

  const clearHistory = () => {
    setMessages([{
      id: "welcome",
      text: "Olá! Sou o Agente Marítimo IA. Posso ajudá-lo com informações sobre o status dos navios e operações portuárias. Como posso ajudar?",
      isUser: false,
      timestamp: new Date()
    }]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { messages, setMessages, clearHistory };
};
