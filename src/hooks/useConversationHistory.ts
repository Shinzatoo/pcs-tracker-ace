import { useState, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const STORAGE_KEY = "agente-maritimo-conversation";

const welcomeMessage: Message = {
  id: "welcome",
  text: "Olá! Sou o Agente Marítimo IA. Posso ajudá-lo com informações sobre o status dos navios e operações portuárias. Como posso ajudar?",
  isUser: false,
  timestamp: new Date()
};

export function useConversationHistory() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
    return [welcomeMessage];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
    }
  }, [messages]);

  const clearHistory = () => {
    setMessages([welcomeMessage]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
  };

  return { messages, setMessages, clearHistory };
}
