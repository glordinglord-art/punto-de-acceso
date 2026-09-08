"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePathname } from "next/navigation";
import { mealsService } from "@/features/meals/services/meals.service";
import {
  clinicalAgentService,
  parseRoutineAction,
  type RoutineAction,
  type RoutineProposal,
} from "@/features/clinical-agent/services/clinical-agent.service";
import { ClinicalRoutineProposalCard } from "@/features/clinical-agent/components/ClinicalRoutineProposalCard";
import { cn } from "@/shared/lib/utils";
import ReactMarkdown from "react-markdown";
import { X, Send, Sparkles, UserCircle, Trash2, Stethoscope, Bot } from "lucide-react";
import { useConfirm } from "@/shared/contexts/ConfirmContext";

interface Message {
  role: "user" | "ai";
  content: string;
}

const DIET_SUGGESTIONS = [
  { label: "🍽️ Recomiéndame una cena", prompt: "Recomiéndame una cena saludable que se ajuste a mis objetivos." },
  { label: "🔥 ¿Cómo voy con mis calorías?", prompt: "¿Cómo voy con mi meta calórica del día según mis comidas registradas hoy?" },
  { label: "💪 ¿Cómo mejorar mi rendimiento?", prompt: "¿Qué consejos me das para rendir al máximo en mis entrenamientos?" },
  { label: "🥗 Ideas de snacks saludables", prompt: "Dame 3 ideas de snacks saludables rápidos y ricos en proteína." },
];

const CLINICAL_SUGGESTIONS = [
  { label: "🚨 ¿Quiénes son mis banderas rojas hoy?", prompt: "🚨 ¿Quiénes son mis banderas rojas hoy y por qué?" },
  { label: "📊 Resumen clínico de cumplimiento", prompt: "📊 Dame un resumen clínico de cumplimiento de mis atletas hoy" },
  { label: "🦴 Lesiones y sobrecargas articulares", prompt: "🦴 ¿Qué atletas tienen lesiones o sobrecargas articulares reportadas?" },
  { label: "🥗 Déficit de proteína o calorías hoy", prompt: "🥗 ¿Quiénes tienen déficit de proteína o calorías hoy?" },
];

export function GlobalAiAssistant() {
  const { user, isAuthenticated, activeMode } = useAuth();
  const pathname = usePathname();
  const isClinical = activeMode === "trainer" || activeMode === "superadmin";

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

  // Load chat history when opened or when role changes
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isOpen) return;

    const fetchHistory = async () => {
      setIsFetchingHistory(true);
      try {
        if (isClinical) {
          // Fetch coach clinical agent history
          const res = await clinicalAgentService.getHistory(user.id);
          if (res?.data && res.data.length > 0) {
            setMessages(res.data.map((m) => ({ role: m.role, content: m.content })));
          } else {
            setMessages([
              {
                role: "ai",
                content: `¡A tus órdenes, Coach ${user.name?.split(" ")[0] ?? ""}! 🩺 Soy tu **Director Clínico IA**.\n\nTengo en memoria la telemetría biológica, adherencia, sobrecargas y rutinas activas de todos tus atletas.\n\nPuedes consultarme por **banderas rojas**, análisis biomecánico o solicitar ajustes tácticos en tiempo real.`,
              },
            ]);
          }
        } else {
          // Fetch athlete diet/meal chat history
          const res = await mealsService.getChatHistory(user.id);
          if (res.data && res.data.length > 0) {
            setMessages(res.data.map((m) => ({ role: m.role, content: m.content })));
          } else {
            setMessages([
              {
                role: "ai",
                content: `¡Hola ${user.name?.split(" ")[0] ?? "Atleta"}! 🥦 Soy tu **asistente nutricional 10X**.\n\nTengo acceso a tus metas, peso, calorías y a tus **últimas comidas registradas** para asesorarte al instante.\n\nPregúntame algo como:\n* *"¿Qué puedo almorzar hoy con buena proteína?"*\n* *"¿Cómo voy con mis calorías?"*\n\n¡Comencemos! ⚡`,
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching chat history", error);
      } finally {
        setIsFetchingHistory(false);
      }
    };

    fetchHistory();
  }, [user?.id, user?.name, isAuthenticated, isOpen, isClinical]);

  const { confirm } = useConfirm();

  const handleClearHistory = async () => {
    if (!user) return;
    const ok = await confirm({
      title: isClinical ? "¿Limpiar terminal clínica?" : "¿Borrar conversación nutricional?",
      description: isClinical
        ? "Se limpiará la memoria temporal de consultas del Director Clínico."
        : "Se limpiará el historial de mensajes con tu Asistente Nutricional.",
      confirmText: "Limpiar chat",
      variant: "danger",
    });
    if (!ok) return;

    try {
      setIsLoading(true);
      if (isClinical) {
        await clinicalAgentService.clearHistory(user.id);
        setMessages([
          {
            role: "ai",
            content: `¡Historial clínico reiniciado, Coach ${user.name?.split(" ")[0] ?? ""}! Listo para escanear a tus atletas.`,
          },
        ]);
      } else {
        await mealsService.clearChatHistory(user.id);
        setMessages([
          {
            role: "ai",
            content: `¡Hola de nuevo ${user.name?.split(" ")[0] ?? "Atleta"}! Historial nutricional limpio. ¿En qué te puedo ayudar hoy?`,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || !user) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: promptText }]);
    setIsLoading(true);

    try {
      if (isClinical) {
        // Send to clinical agent service
        const res = await clinicalAgentService.sendMessage(user.id, promptText);
        const reply = res?.data?.reply || "Respuesta generada por el Director Clínico.";
        setMessages((prev) => [...prev, { role: "ai", content: reply }]);
      } else {
        // Send to diet recommender service
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
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "❌ Ocurrió un error al contactar al asistente. Asegúrate de que el servidor esté activo y la clave de IA configurada.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionApplied = (followUpMessage?: string) => {
    if (followUpMessage) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: followUpMessage,
        },
      ]);
      setTimeout(scrollToBottom, 120);
    }
  };

  // If on the full-page clinical terminal, don't show the duplicate floating button
  if (pathname === "/clinical-agent") {
    return null;
  }

  const suggestions = isClinical ? CLINICAL_SUGGESTIONS : DIET_SUGGESTIONS;

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-4 lg:bottom-6 lg:right-20 z-40",
          "flex items-center gap-2.5 p-3.5 sm:p-4 rounded-full text-white",
          "transition-all duration-300 group hover:scale-105 active:scale-95 shadow-2xl backdrop-blur-xl border border-white/20",
          isClinical
            ? "bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_10px_30px_rgba(6,182,212,0.35)]"
            : "bg-gradient-to-r from-primary-600 via-rose-600 to-primary-500 hover:from-primary-500 hover:to-rose-500 shadow-[0_10px_30px_rgba(239,68,68,0.35)]"
        )}
        aria-label={isClinical ? "Consultar Director Clínico IA" : "Consultar Nutrición IA"}
      >
        {isClinical ? (
          <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform shrink-0 text-cyan-200" />
        ) : (
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse shrink-0 text-rose-100" />
        )}
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-black text-xs uppercase tracking-wider whitespace-nowrap">
          {isClinical ? "Director Clínico IA" : "Nutrición IA"}
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
          "lg:top-0 lg:bottom-auto lg:left-auto lg:right-0 lg:h-full lg:w-[420px] lg:rounded-none",
          "border-t border-slate-200 bg-white text-slate-950 shadow-2xl lg:border-t-0 lg:border-l dark:border-white/10 dark:bg-[#0c0d10] dark:text-white",
          "transform transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-y-0 lg:translate-x-full"
        )}
      >
        {/* Mobile Swipe Bar */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md",
                isClinical
                  ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/20"
                  : "bg-gradient-to-br from-primary-500 to-primary-300 shadow-primary-500/20"
              )}
            >
              {isClinical ? <Stethoscope className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider leading-none text-neutral-900 dark:text-white">
                {isClinical ? "Director Clínico IA" : "Asistente de Nutrición IA"}
              </h2>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mt-1">
                {isClinical ? "Supervisión Médica & Biomecánica" : "Macronutrientes, Calorías & Comidas"}
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar scroll-smooth bg-slate-50/50 dark:bg-black/20">
          {isFetchingHistory ? (
            <div className="flex flex-col justify-center items-center h-full text-neutral-400 space-y-4">
              <Sparkles
                className={cn(
                  "w-8 h-8 animate-pulse",
                  isClinical ? "text-cyan-400" : "text-primary-500"
                )}
              />
              <span className="text-xs font-bold uppercase tracking-widest">
                {isClinical ? "Sincronizando telemetría de atletas..." : "Sincronizando memoria nutricional..."}
              </span>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                let actionData: RoutineAction | RoutineProposal | null = null;
                let cleanContent = msg.content;

                if (isClinical && !isUser) {
                  const parsed = parseRoutineAction(msg.content);
                  actionData = parsed.actionData;
                  cleanContent = parsed.cleanText;
                } else {
                  cleanContent = msg.content
                    .replace(/\[COMANDO_RUTINA:[^\]]*\]/g, "")
                    .replace(/\(ID:\s*[0-9a-f-]{10,}\)/gi, "")
                    .trim();
                }

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-3",
                      isUser ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm border",
                        isUser
                          ? "bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : isClinical
                          ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300"
                          : "bg-primary-500/20 border-primary-500/30 text-primary-300"
                      )}
                    >
                      {isUser ? (
                        <UserCircle className="w-4 h-4" />
                      ) : isClinical ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>

                    <div
                      className={cn(
                        proposalData ? "max-w-[95%] sm:max-w-[90%]" : "max-w-[85%]",
                        "rounded-2xl p-4 text-xs leading-relaxed shadow-sm",
                        isUser
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-tr-none font-medium"
                          : "bg-white dark:bg-[#151922] text-neutral-800 dark:text-slate-100 border border-slate-200/70 dark:border-white/10 rounded-tl-none"
                      )}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap font-sans">{cleanContent}</div>
                      ) : (
                        <>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed space-y-2">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-sm font-black text-cyan-400 dark:text-cyan-300 mt-2 mb-1 uppercase tracking-wider">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xs font-black text-cyan-300 dark:text-cyan-200 mt-2 mb-1 uppercase tracking-wider">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-xs font-bold text-white mt-1.5 mb-1">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-1.5 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-200">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc pl-4 space-y-1 mb-2 text-slate-700 dark:text-slate-200">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal pl-4 space-y-1 mb-2 text-slate-700 dark:text-slate-200">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-slate-700 dark:text-slate-200">{children}</li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-slate-950 dark:text-white">
                                    {children}
                                  </strong>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-2 border-cyan-400/60 pl-3 italic text-cyan-200/90 my-1 bg-cyan-950/20 py-1 rounded-r-lg">
                                    {children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {cleanContent}
                            </ReactMarkdown>
                          </div>

                          {actionData && user?.id && (
                            <div className="mt-3">
                              <ClinicalRoutineProposalCard
                                actionData={actionData}
                                trainerId={user.id}
                                onApplied={handleActionApplied}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Suggestion Chips */}
              {messages.length <= 1 && (
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">
                    Consultas recomendadas
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sug.prompt)}
                        className="text-left w-full p-3 rounded-xl border border-slate-200/60 bg-white/80 hover:bg-neutral-50 dark:border-white/5 dark:bg-[#15161b]/60 dark:hover:bg-[#1a1b22] text-xs font-medium text-slate-700 dark:text-neutral-300 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{sug.label}</span>
                        <Send className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {isLoading && (
            <div className="flex items-start gap-3 flex-row">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-md",
                  isClinical
                    ? "bg-cyan-500 shadow-cyan-500/20"
                    : "bg-primary-500 shadow-primary-500/20"
                )}
              >
                {isClinical ? <Stethoscope className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className="bg-white dark:bg-neutral-950 rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-200/50 dark:border-white/5">
                <div className="flex gap-1.5 items-center h-5">
                  <div
                    className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
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
              placeholder={
                isClinical
                  ? "Consulta sobre banderas rojas, sobrecargas, atletas o rutinas..."
                  : "Pregúntame sobre tu dieta, comidas o plan..."
              }
              className={cn(
                "w-full bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-transparent rounded-2xl pl-5 pr-14 py-3.5 text-xs sm:text-sm focus:outline-none focus:ring-4 transition-all placeholder-neutral-400",
                isClinical
                  ? "focus:border-cyan-500/50 focus:ring-cyan-500/10"
                  : "focus:border-primary-500/50 focus:ring-primary-500/10"
              )}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute right-2 flex items-center justify-center w-10 h-10 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:pointer-events-none",
                isClinical
                  ? "bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-neutral-800 dark:disabled:to-neutral-800"
                  : "bg-gradient-to-br from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-neutral-800 dark:disabled:to-neutral-800"
              )}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <p className="text-center text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-2.5">
            {isClinical
              ? "🧠 Modelo Clínico 2.5 Flash sincronizado con telemetría en vivo"
              : "🥦 IA con contexto nutricional activo"}
          </p>
        </div>
      </div>
    </>
  );
}
