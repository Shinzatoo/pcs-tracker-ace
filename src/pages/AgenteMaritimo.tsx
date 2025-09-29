import { useState } from "react";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";

const messageSchema = z.object({
  text: z.string()
    .trim()
    .min(1, { message: "Mensagem não pode estar vazia" })
    .max(1000, { message: "Mensagem deve ter menos de 1000 caracteres" }),
  sessionId: z.string().min(1)
});

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const predefinedQuestions = [
  "Quantos navios estão com status de Ok?",
  "Quais navios estão com problemas?",
  "Qual é o status atual do porto?",
  "Quantos navios estão aguardando autorização?",
  "Há navios com operação cancelada?",
  "Qual é o resumo dos embarques hoje?"
];

export default function AgenteMaritimo() {
  const { messages, setMessages, clearHistory } = useConversationHistory();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Validate input
    let validatedInput;
    try {
      validatedInput = messageSchema.parse({
        text: text.trim(),
        sessionId: "user-123"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: error.errors[0]?.message || "Entrada inválida.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: validatedInput.text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('https://n8n.srv1034002.hstgr.cloud/webhook/"ai-agent-webhook"', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: validatedInput.text,
          sessionId: validatedInput.sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o agente');
      }

      // The webhook is returning plain text, not JSON
      const responseText = await response.text();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      let errorText = "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.";
      let debugInfo = "";
      
      if (error instanceof Error) {
        // Add debug information for webhook errors
        if (error.message.includes('Falha na comunicação')) {
          try {
            const debugResponse = await fetch('https://n8n.srv1034002.hstgr.cloud/webhook/"ai-agent-webhook"', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: validatedInput.text,
                sessionId: validatedInput.sessionId
              })
            });
            const responseData = await debugResponse.text();
            debugInfo = `\n\nDebug - Resposta do webhook:\n${responseData}`;
          } catch (debugError) {
            debugInfo = `\n\nDebug - Erro ao tentar acessar webhook: ${debugError}`;
          }
        }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText + debugInfo,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent mb-2">
          Agente Maritime
        </h1>
        <p className="text-muted-foreground">
          Assistente virtual especializado em operações portuárias e status de embarques
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Perguntas Predefinidas */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>Perguntas Sugeridas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {predefinedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto py-2 px-3 whitespace-normal"
                  onClick={() => handleQuestionClick(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[70vh] max-h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>Conversa com o Agente</span>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  disabled={isLoading}
                  title="Limpar histórico"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4 overflow-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[80%] ${
                          message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.isUser 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          {message.isUser ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite sua pergunta sobre o porto..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}