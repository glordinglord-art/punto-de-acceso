import { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/Button";
import { clinicalAgentService } from "@/features/clinical-agent/services/clinical-agent.service";
import type { User } from "@/shared/types/common.types";
import ReactMarkdown from "react-markdown";
import {
  Trash2,
  Send,
  Sparkles,
  UserCircle,
  Lock,
  FileText,
  Save,
  Stethoscope,
} from "lucide-react";
import { useConfirm } from "@/shared/contexts/ConfirmContext";
import { toast } from "react-hot-toast";

interface ClientAiChatProps {
  client: User;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

const CASE_PROMPTS = [
  "📐 Audita sus series efectivas semanales (MEV-MAV-MRV) y dime si hay volumen basura o déficit",
  "⚖️ Evalúa su ritmo de pesaje en ayunas (+0.25 o -0.50 kg/sem) y sugiere ajuste calórico",
  "🌙 Analiza su regularidad de sueño (±1h), hidratación y recuperación del SNC",
  "📝 Redacta y publica su Reporte Semanal de esta semana con base en sus 3 pilares",
];

export function ClientAiChat({ client }: ClientAiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateNotes, setPrivateNotes] = useState<string>("");
  const [savingNotes, setSavingNotes] = useState(false);
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
      setIsFetchingHistory(true);
      try {
        const res = await clinicalAgentService.getAthleteCaseHistory(client.id);
        const notes = res?.data?.trainerPrivateNotes || "";
        setPrivateNotes(notes);
        const historyMsgs = res?.data?.messages || [];
        if (historyMsgs.length > 0) {
          setMessages(
            historyMsgs.map((m) => ({ role: m.role, content: m.content })),
          );
        } else {
          setMessages([
            {
              role: "ai",
              content: `🔒 **Memoria Clínica Privada de ${client.name} activada.**\n\nEste espacio es **100% confidencial para ti como Entrenador** (el atleta jamás ve esta conversación ni tus notas clínicas).\n\nTengo cargados en vivo sus **4 Objetivos de 120 Días**, su **Volumen Semanal por Músculo (MEV-MAV-MRV)**, sus **pesajes en ayunas**, **litros de agua** y **regularidad de sueño (±1h)**.\n\nPodemos discutir hipótesis clínicas, guardar acuerdos en su bitácora privada o ejecutar ajustes directos en su rutina y metas.`,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching athlete clinical memory", error);
      } finally {
        setIsFetchingHistory(false);
      }
    };
    fetchHistory();
  }, [client.id, client.name]);

  const { confirm } = useConfirm();

  const handleClearHistory = async () => {
    const ok = await confirm({
      title: "¿Reiniciar chat clínico de este atleta?",
      description:
        "Se limpiarán los mensajes de consulta con el Agente Clínico (tu bitácora de notas privadas arriba se conservará).",
      confirmText: "Limpiar chat",
      variant: "danger",
    });
    if (!ok) return;
    try {
      setIsLoading(true);
      await clinicalAgentService.clearAthleteCaseHistory(client.id);
      setMessages([
        {
          role: "ai",
          content: `🔒 **Memoria de chat reiniciada para ${client.name}.** Tu bitácora clínica privada sigue activa. ¿Qué aspecto de su progreso analizamos hoy?`,
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrivateNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await clinicalAgentService.sendAthleteCaseMessage(client.id, {
        message:
          "Actualicé la bitácora clínica privada del atleta. Confirma que la tienes en memoria y dame un diagnóstico breve de 3 líneas.",
        trainerPrivateNotes: privateNotes,
      });
      if (res?.data?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: res.data.reply },
        ]);
      }
      toast.success("🔒 Bitácora clínica privada guardada en la ficha");
    } catch {
      toast.error("No se pudo guardar la bitácora clínica");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const userMessage = (customPrompt || input).trim();
    if (!userMessage || isLoading) return;

    if (!customPrompt) setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await clinicalAgentService.sendAthleteCaseMessage(client.id, {
        message: userMessage,
        trainerPrivateNotes: privateNotes,
      });
      if (res?.data?.trainerPrivateNotes !== undefined) {
        setPrivateNotes(res.data.trainerPrivateNotes);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            res?.data?.reply ||
            "Diagnóstico procesado en la memoria clínica del atleta.",
        },
      ]);
    } catch (error) {
      console.error("Clinical Case AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "❌ Ocurrió un error consultando al Agente Clínico. Verifica la conexión del servidor.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-cyan-500/25 bg-[#0a0d14] overflow-hidden">
      {/* Banner de Confidencialidad Entrenador <-> Agente Clínico */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-amber-950/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-condensed font-black uppercase tracking-wider text-white">
                Expediente & Memoria Clínica IA: {client.name}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                <Lock className="w-2.5 h-2.5" /> Privado Entrenador (Oculto al Atleta)
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Discute el caso con el Agente Clínico, guarda hallazgos biomecánicos y ejecuta cambios en su rutina o metas.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-xs font-condensed uppercase tracking-wider font-bold text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Limpiar Chat
        </Button>
      </div>

      {/* Bitácora Permanente de Notas Clínicas Privadas del Entrenador */}
      <div className="p-3.5 bg-white/[0.02] border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Bitácora Clínica Permanente del Entrenador (Contexto fijo para la IA):
          </label>
          <button
            type="button"
            disabled={savingNotes || isLoading}
            onClick={handleSavePrivateNotes}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-bold text-cyan-200 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            <span>{savingNotes ? "Guardando..." : "Guardar en Memoria"}</span>
          </button>
        </div>
        <textarea
          rows={2}
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          placeholder="Escribe aquí observaciones privadas del atleta (ej. molestia leve en hombro derecho al bajar de RIR 1, responde mejor a frecuencia 2 en pierna, tiende a subestimar calorías el fin de semana)..."
          className="w-full rounded-xl bg-black/50 border border-white/10 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-cyan-500/50 focus:outline-none"
        />
      </div>

      {/* Botones Rápidos de Discusión Clínica */}
      <div className="px-3.5 py-2 bg-black/40 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {CASE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            disabled={isLoading}
            onClick={() => handleSend(prompt)}
            className="shrink-0 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 px-2.5 py-1.5 text-[11px] font-medium text-neutral-300 hover:text-cyan-200 transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Historial de Discusión Clínica */}
      <div className="h-[340px] overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth">
        {isFetchingHistory ? (
          <div className="flex flex-col justify-center items-center h-full text-neutral-400 space-y-3">
            <Sparkles className="w-7 h-7 animate-pulse text-cyan-400" />
            <span className="text-xs font-condensed font-bold uppercase tracking-widest">
              Cargando expediente clínico privado...
            </span>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                  msg.role === "user"
                    ? "bg-red-500/20 border-red-500/30 text-red-300"
                    : "bg-cyan-500/20 border-cyan-500/30 text-cyan-300"
                }`}
              >
                {msg.role === "user" ? (
                  <UserCircle className="w-4 h-4" />
                ) : (
                  <Stethoscope className="w-4 h-4" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-red-600/20 border border-red-500/30 text-white rounded-tr-none"
                    : "bg-[#131824] text-neutral-200 border border-white/10 rounded-tl-none prose prose-sm prose-invert max-w-none"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-start gap-3 flex-row">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#131824] rounded-2xl rounded-tl-none px-4 py-3 text-xs text-cyan-300 border border-white/10">
              Analizando telemetría, volumen semanal MEV-MAV-MRV y bitácora privada...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Barra de Entrada */}
      <div className="p-3 bg-black/60 border-t border-white/10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Discute el caso de ${client.name} o pídele al Agente Clínico ejecutar un ajuste...`}
            className="w-full bg-white/5 text-white border border-white/10 focus:border-cyan-500/50 rounded-xl pl-4 pr-12 py-3 text-xs focus:outline-none transition-all placeholder-neutral-500"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 flex items-center justify-center w-9 h-9 bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
