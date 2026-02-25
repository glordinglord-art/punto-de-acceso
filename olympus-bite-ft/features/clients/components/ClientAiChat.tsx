import { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/Button";
import { mealsService } from "@/features/meals/services/meals.service";
import type { User } from "@/shared/types/common.types";
import ReactMarkdown from "react-markdown";

interface ClientAiChatProps {
  client: User;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

export function ClientAiChat({ client }: ClientAiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await mealsService.getChatHistory(client.id);
        if (res.data && res.data.length > 0) {
          setMessages(
            res.data.map((m) => ({ role: m.role, content: m.content })),
          );
        } else {
          setMessages([
            {
              role: "ai",
              content:
                "¡Hola! Soy tu asistente de dietas y **tengo memoria perfecta** de nuestras charlas. Dame un objetivo como *'Necesito una cena rápida alta en proteínas'* o dime *'Hoy el helado me cayó mal, ¿por qué?'* y te ayudaré.",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching chat history", error);
      } finally {
        setIsFetchingHistory(false);
      }
    };
    fetchHistory();
  }, [client.id]);

  const handleClearHistory = async () => {
    if (!confirm("¿Seguro que deseas borrar el historial de chat con esta IA?"))
      return;
    try {
      setIsLoading(true);
      await mealsService.clearChatHistory(client.id);
      setMessages([
        {
          role: "ai",
          content:
            "¡Hola! Soy tu asistente de dietas y **tengo memoria perfecta** de nuestras charlas. Dame un objetivo como *'Necesito una cena rápida alta en proteínas'* o dime *'Hoy el helado me cayó mal, ¿por qué?'* y te ayudaré.",
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Backend now loads chat history directly from the database!
      const res = await mealsService.chatRecommendation(client.id, {
        prompt: userMessage,
        context: {
          goal: client.dietaryGoal || undefined,
          weight: client.weight ?? undefined,
          height: client.height ?? undefined,
          experienceLevel: client.experienceLevel || undefined,
          medicalConditions: client.medicalConditions || undefined,
          dietaryPreferences: client.dietaryPreferences || undefined,
          targetCalories: client.targetCalories,
        },
      });

      setMessages((prev) => [...prev, { role: "ai", content: res.data.text }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "❌ Ocurrió un error consultando a la IA. Revisa tu conexión u API Keys.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          🗑️ Limpiar historial
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 p-4 mb-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
        {isFetchingHistory ? (
          <div className="flex justify-center items-center h-full text-neutral-400 text-sm">
            Cargando memoria... 🧠
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                  msg.role === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-gray-100 border border-neutral-100 dark:border-neutral-600 prose prose-sm dark:prose-invert"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-neutral-700 rounded-2xl p-4 text-sm text-neutral-500 animate-pulse border border-neutral-100 dark:border-neutral-600">
              Generando recomendación mágica... ✨
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escribe qué necesitas ej. 'Ideas para el desayuno'..."
          className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
          {isLoading ? "..." : "Enviar"}
        </Button>
      </div>
    </div>
  );
}
