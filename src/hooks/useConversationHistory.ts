import { useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const STORAGE_KEY = 'agente-maritimo-conversation';

const loadMessagesFromStorage = (): Message[] => {
  console.log('🔍 Loading conversation history from localStorage...');
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('📦 Stored data:', stored);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ Loaded messages:', parsed.length);
      // Convert timestamp strings back to Date objects
      const messages = parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      
      // Always return at least the welcome message if storage is empty or only has welcome
      if (messages.length === 0 || (messages.length === 1 && messages[0].id === "welcome")) {
        console.log('⚠️ Only welcome message found, returning fresh welcome');
        return [{
          id: "welcome",
          text: "Olá! Sou o Agente Marítimo IA. Posso ajudá-lo com informações sobre o status dos navios e operações portuárias. Como posso ajudar?",
          isUser: false,
          timestamp: new Date()
        }];
      }
      
      return messages;
    }
  } catch (error) {
    console.error('❌ Error loading conversation history:', error);
  }
  
  console.log('⚠️ No stored history found, using default welcome message');
  // Default welcome message
  return [{
    id: "welcome",
    text: "Olá! Sou o Agente Marítimo IA. Posso ajudá-lo com informações sobre o status dos navios e operações portuárias. Como posso ajudar?",
    isUser: false,
    timestamp: new Date()
  }];
};

export const useConversationHistory = () => {
  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage);

  useEffect(() => {
    console.log('💾 Saving conversation history...', messages.length, 'messages');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      console.log('✅ Conversation history saved successfully');
    } catch (error) {
      console.error('❌ Error saving conversation history:', error);
    }
  }, [messages]);

  const clearHistory = () => {
    const welcomeMessage = [{
      id: "welcome",
      text: "Olá! Sou o Agente Marítimo IA. Posso ajudá-lo com informações sobre o status dos navios e operações portuárias. Como posso ajudar?",
      isUser: false,
      timestamp: new Date()
    }];
    setMessages(welcomeMessage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(welcomeMessage));
  };

  return { messages, setMessages, clearHistory };
};
