const fs = require('fs');
const path = require('path');

const filePathMeals = path.join(__dirname, 'olympus-bite-ft/features/clients/components/ClientMealsProgress.tsx');

const mealsProgressContent = `import { useState, useEffect } from "react";
import { mealsService } from "@/features/meals/services/meals.service";
import type { Meal } from "@/features/meals/types/meals.types";
import { Card } from "@/shared/components/ui/Card";
import { cn, getLocalDateString, localDateToRange } from "@/shared/lib/utils";
import { Flame, Target, Info, AlertTriangle } from "lucide-react";

interface ClientMealsProgressProps {
  clientId: string;
  targetCalories: number | null;
}

export function ClientMealsProgress({
  clientId,
  targetCalories,
}: ClientMealsProgressProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        // We fetch only today's meals for the progress bar
        const today = getLocalDateString();
        const { start, end } = localDateToRange(today);
        const res = await mealsService.getByDateRange(clientId, start, end);
        setMeals(res.data);
      } catch (error) {
        console.error("Error fetching client meals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [clientId]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-neutral-50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 animate-pulse">
        <div className="h-10 bg-neutral-200 dark:bg-white/10 w-1/2 mx-auto rounded-xl mb-4"></div>
        <div className="h-6 bg-neutral-200 dark:bg-white/10 w-3/4 mx-auto rounded-xl"></div>
      </div>
    );
  }

  const currentCalories = meals.reduce(
    (sum, meal) => sum + (meal.calories || 0),
    0,
  );
  const goal = targetCalories || 2200; // Fallback
  const progressPercentage = Math.min((currentCalories / goal) * 100, 100);
  const isOverGoal = currentCalories > goal;

  return (
    <div className="space-y-6">
      {/* Resumen de Calorías del Día */}
      <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
              Consumo de Hoy
            </h3>
            <p className="text-xs font-medium text-neutral-500">Monitor de progreso calórico</p>
          </div>
        </div>

        <div className="flex justify-between items-end mb-3">
          <div>
            <span className={cn("text-5xl font-condensed font-bold tracking-tight", isOverGoal ? "text-red-500" : "text-primary-600 dark:text-primary-400")}>
              {currentCalories.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-neutral-500 ml-2 uppercase tracking-wider font-condensed">
              kcal consumidas
            </span>
          </div>
          <div className="text-right">
            <span className="flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-black/30 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10">
              <Target className="w-4 h-4 text-neutral-500" />
              Meta: {goal.toLocaleString()} kcal
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-neutral-100 dark:bg-black/40 rounded-full h-4 mb-3 overflow-hidden shadow-inner border border-white/5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]",
              isOverGoal ? "bg-gradient-to-r from-red-500 to-rose-500" : "bg-gradient-to-r from-primary-600 to-primary-400"
            )}
            style={{ width: \`\${progressPercentage}%\` }}
          />
        </div>

        {isOverGoal && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-100 dark:border-red-500/20">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              El cliente ha superado su límite calórico en <strong className="font-bold">{currentCalories - goal} kcal</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Lista de Comidas del Día */}
      <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white mb-6">
          Comidas Registradas Hoy
        </h3>
        
        {meals.length === 0 ? (
          <div className="text-center p-10 bg-neutral-50 dark:bg-black/20 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-white/10">
            <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-neutral-100 dark:border-white/5">
              <span className="text-2xl block">🍽️</span>
            </div>
            <p className="text-sm font-medium text-neutral-500">
              No se han registrado comidas el día de hoy.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex flex-col p-4 bg-neutral-50 dark:bg-black/20 rounded-2xl border border-neutral-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                    {meal.name}
                  </h4>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-lg font-condensed font-bold tracking-tight text-primary-600 dark:text-primary-400">
                      {meal.calories}
                    </span>
                    <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-500 ml-1">kcal</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 bg-white dark:bg-white/10 px-2.5 py-1 rounded-md shadow-sm">
                    {meal.mealType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePathMeals, mealsProgressContent);
console.log('Done replacing ClientMealsProgress.tsx');

const filePathAi = path.join(__dirname, 'olympus-bite-ft/features/clients/components/ClientAiChat.tsx');

const aiChatContent = `import { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/Button";
import { mealsService } from "@/features/meals/services/meals.service";
import type { User } from "@/shared/types/common.types";
import ReactMarkdown from "react-markdown";
import { Trash2, Send, Sparkles, UserCircle } from "lucide-react";

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
              className={\`flex items-start gap-4 \${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }\`}
            >
              <div className={\`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg \${
                msg.role === "user" 
                  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-500" 
                  : "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-purple-500/20"
              }\`}>
                {msg.role === "user" ? <UserCircle className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div
                className={\`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm \${
                  msg.role === "user"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-tr-none"
                    : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/5 rounded-tl-none prose prose-sm dark:prose-invert max-w-none"
                }\`}
              >
                <ReactMarkdown className="leading-relaxed">{msg.content}</ReactMarkdown>
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
`;

fs.writeFileSync(filePathAi, aiChatContent);
console.log('Done replacing ClientAiChat.tsx');