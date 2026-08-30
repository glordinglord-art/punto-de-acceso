import { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/Button";
import { mealsService } from "@/features/meals/services/meals.service";
import type { User } from "@/shared/types/common.types";
import ReactMarkdown from "react-markdown";
import { Trash2, Send, Sparkles, UserCircle } from "lucide-react";
import { useConfirm } from "@/shared/contexts/ConfirmContext";

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

  const { confirm } = useConfirm();

  const handleClearHistory = async () => {
    const ok = await confirm({
      title: '¿Borrar historial?',
      description: 'Se eliminarán todos los mensajes de esta conversación con la IA.',
      confirmText: 'Borrar historial',
      variant: 'danger',
    });
    if (!ok) return;
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
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black/20">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-white/5 bg-white dark:bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white leading-tight">
              Asistente Nutricional
            </h3>
            <p className="text-[10px] font-condensed font-bold text-neutral-400 uppercase tracking-widest">
              Potenciado por Gemini
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-xs font-condensed uppercase tracking-wider font-bold text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Limpiar
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
        {isFetchingHistory ? (
          <div className="flex flex-col justify-center items-center h-full text-neutral-400 space-y-4">
            <Sparkles className="w-8 h-8 animate-pulse text-primary-500" />
            <span className="text-sm font-condensed font-bold uppercase tracking-widest">Sincronizando memoria...</span>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                msg.role === "user" 
                  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-500" 
                  : "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-purple-500/20"
              }`}>
                {msg.role === "user" ? <UserCircle className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-tr-none"
                    : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/5 rounded-tl-none prose prose-sm dark:prose-invert max-w-none"
                }`}
              >
                <div className="leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start gap-4 flex-row">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl rounded-tl-none p-4 shadow-sm border border-neutral-200 dark:border-white/5">
              <div className="flex gap-1.5 items-center h-5">
                <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pregúntale al asistente sobre el plan de tu cliente..."
            className="w-full bg-neutral-100 dark:bg-black/40 text-neutral-900 dark:text-white border border-transparent focus:border-primary-500/50 rounded-2xl pl-5 pr-14 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all placeholder-neutral-400"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 flex items-center justify-center w-10 h-10 bg-primary-600 hover:bg-primary-500 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white rounded-xl transition-colors shadow-sm disabled:shadow-none"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-neutral-400 font-medium mt-2">
          La IA tiene contexto de las métricas y perfil del cliente actual
        </p>
      </div>
    </div>
  );
}
