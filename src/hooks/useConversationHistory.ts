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
  text: "Olá! Sou o Agente Maritime. Posso ajudá-lo com informações sobre o status dos navios e operações portuárias. Como posso ajudar?",
  isUser: false,
  timestamp: new Date()
};

export function useConversationHistory() {
  const [messages, setMessages] = useState<Message[]>(() => {
    console.log("🔄 Inicializando histórico de conversas...");
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log("📦 Dados do localStorage:", stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        console.log("✅ Histórico carregado:", messagesWithDates.length, "mensagens");
        return messagesWithDates;
      }
    } catch (error) {
      console.error("❌ Erro ao carregar histórico:", error);
    }
    console.log("📝 Usando mensagem de boas-vindas inicial");
    return [welcomeMessage];
  });

  useEffect(() => {
    console.log("💾 Salvando", messages.length, "mensagens no localStorage");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      console.log("✅ Histórico salvo com sucesso");
    } catch (error) {
      console.error("❌ Erro ao salvar histórico:", error);
    }
  }, [messages]);

  const clearHistory = () => {
    console.log("🗑️ Limpando histórico de conversas");
    setMessages([welcomeMessage]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
    console.log("✅ Histórico limpo");
  };

  return { messages, setMessages, clearHistory };
}
