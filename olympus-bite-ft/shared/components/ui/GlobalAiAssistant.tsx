"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { mealsService } from "@/features/meals/services/meals.service";
import { cn } from "@/shared/lib/utils";
import ReactMarkdown from "react-markdown";
import { X, Send, Sparkles, UserCircle, Trash2, MessageSquare } from "lucide-react";
import type { User } from "@/shared/types/common.types";

interface Message {
  role: "user" | "ai";
  content: string;
}

const SUGGESTIONS = [
  { label: "🍽️ Recomiéndame una cena", prompt: "Recomiéndame una cena saludable que se ajuste a mis objetivos." },
  { label: "🔥 ¿Cómo voy con mis calorías?", prompt: "¿Cómo voy con mi meta calórica del día según mis comidas registradas hoy?" },
  { label: "💪 ¿Cómo mejorar mi rutina?", prompt: "¿Qué consejos me das para rendir al máximo en mis entrenamientos?" },
  { label: "🥗 Ideas de snacks saludables", prompt: "Dame 3 ideas de snacks saludables rápidos y ricos en proteína." },
];

export function GlobalAiAssistant() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ai-assistant", handleOpen);
    return () => window.removeEventListener("open-ai-assistant", handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isOpen) return;

    const fetchHistory = async () => {
      setIsFetchingHistory(true);
      try {
        const res = await mealsService.getChatHistory(user.id);
        if (res.data && res.data.length > 0) {
          setMessages(
            res.data.map((m) => ({ role: m.role, content: m.content })),
          );
        } else {
          setMessages([
            {
              role: "ai",
              content: `¡Hola ${user.name?.split(" ")[0] ?? "Atleta"}! 🥦 Soy tu **asistente inteligente 10X**.\n\nTengo acceso a tus objetivos, peso, altura y a tus **últimas comidas registradas** para darte consejos 100% personalizados.\n\nPregúntame algo como:\n* *"¿Qué puedo almorzar hoy?"*\n* *"¿Qué snack me conviene comer después de entrenar?"*\n\n¡Estoy listo para ayudarte! ⚡`,
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
  }, [user?.id, user?.name, isAuthenticated, isOpen]);

  if (!isAuthenticated || !user) return null;

  const handleClearHistory = async () => {
    if (!confirm("¿Seguro que deseas borrar el historial de chat con esta IA?"))
      return;
    try {
      setIsLoading(true);
      await mealsService.clearChatHistory(user.id);
      setMessages([
        {
          role: "ai",
          content: `¡Hola de nuevo ${user.name?.split(" ")[0] ?? "Atleta"}! Historial limpio. ¿En qué te puedo ayudar hoy?`,
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: promptText }]);
    setIsLoading(true);

    try {
      const res = await mealsService.chatRecommendation(user.id, {
        prompt: promptText,
        context: {
          goal: user.dietaryGoal || undefined,
          weight: user.weight ?? undefined,
          height: user.height ?? undefined,
          experienceLevel: user.experienceLevel || undefined,
          medicalConditions: user.medicalConditions || undefined,
          dietaryPreferences: user.dietaryPreferences || undefined,
          targetCalories: user.targetCalories,
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
            "❌ Ocurrió un error al contactar al asistente. Asegúrate de que el servidor backend esté corriendo y tus API Keys configuradas.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-20 z-40
          flex items-center gap-2
          p-4 bg-gradient-to-br from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300
          shadow-[0_10px_30px_rgba(var(--color-primary-500),0.3)] dark:shadow-[0_10px_35px_rgba(var(--color-primary-500),0.15)]
          rounded-full text-white
          transition-all duration-300 group
          hover:scale-105 active:scale-95"
        aria-label="Preguntar a la IA"
      >
        <Sparkles className="w-6 h-6 group-hover:animate-pulse shrink-0" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-xs uppercase tracking-wider whitespace-nowrap">
          Asistente IA
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Drawer Container */}
      <div
        className={cn(
          "fixed z-50 flex flex-col",
          // Mobile: Full width bottom sheet
          "bottom-0 left-0 right-0 h-[85vh] rounded-t-[32px]",
          // Desktop: Right side panel
          "lg:top-0 lg:bottom-auto lg:left-auto lg:right-0 lg:h-full lg:w-96 lg:rounded-none",
          "border-t border-slate-200 bg-white text-slate-950 shadow-2xl lg:border-t-0 lg:border-l dark:border-white/10 dark:bg-[#0c0d10] dark:text-white",
          "transform transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-y-0 lg:translate-x-full",
        )}
      >
        {/* Mobile Swipe Bar */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center shadow-md shadow-primary-500/20 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider leading-none text-neutral-900 dark:text-white">
                Mi Asistente IA
              </h2>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mt-0.5">
                Memoria Activa & Contexto 10x
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Limpiar memoria del chat"
              className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-xl transition-all dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-neutral-500 hover:text-slate-950 dark:hover:bg-white/10 dark:text-neutral-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body / Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth bg-slate-50/50 dark:bg-black/10">
          {isFetchingHistory ? (
            <div className="flex flex-col justify-center items-center h-full text-neutral-400 space-y-4">
              <Sparkles className="w-8 h-8 animate-pulse text-purple-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Sincronizando memoria...</span>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3.5",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-sm",
                    msg.role === "user"
                      ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-300"
                      : "bg-gradient-to-br from-primary-500 to-primary-300 text-white"
                  )}>
                    {msg.role === "user" ? <UserCircle className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl p-4 text-sm shadow-sm leading-relaxed prose prose-sm dark:prose-invert",
                      msg.role === "user"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-tr-none"
                        : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-slate-200/50 dark:border-white/5 rounded-tl-none"
                    )}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {/* Suggestion Chips - show only when no custom conversation has started or history is cleared */}
              {messages.length <= 1 && (
                <div className="space-y-2 pt-4">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">
                    Sugerencias rápidas
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTIONS.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sug.prompt)}
                        className="text-left w-full p-3 rounded-xl border border-slate-200/60 bg-white/80 hover:bg-neutral-50 dark:border-white/5 dark:bg-[#15161b]/60 dark:hover:bg-[#1a1b22] text-xs font-medium text-slate-700 dark:text-neutral-300 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm flex items-center justify-between"
                      >
                        <span>{sug.label}</span>
                        <Send className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {isLoading && (
            <div className="flex items-start gap-3.5 flex-row">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-300 text-white shadow-lg shadow-primary-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="bg-white dark:bg-neutral-950 rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-200/50 dark:border-white/5">
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

        {/* Drawer Input Area */}
        <div className="p-4 bg-white dark:bg-[#0c0d10] border-t border-slate-200 dark:border-white/5 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pregúntame sobre tu dieta, comidas o plan..."
              className="w-full bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-transparent focus:border-purple-500/50 rounded-2xl pl-5 pr-14 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all placeholder-neutral-400"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-neutral-800 dark:disabled:to-neutral-800 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <p className="text-center text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-2.5">
            IA con contexto nutricional activo
          </p>
        </div>
      </div>
    </>
  );
}
