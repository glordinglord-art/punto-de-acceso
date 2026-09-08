'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Send,
  Sparkles,
  Trash2,
  Loader2,
  Bot,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import ReactMarkdown from 'react-markdown';
import {
  clinicalAgentService,
  type ChatMessage,
  type RoutineProposal,
} from '../services/clinical-agent.service';
import { ClinicalRoutineProposalCard } from './ClinicalRoutineProposalCard';

interface ClinicalAgentTerminalProps {
  trainerId: string;
  trainerName: string;
}

const QUICK_PROMPTS = [
  '🚨 ¿Quiénes son mis banderas rojas hoy y por qué?',
  '📊 Dame un resumen clínico de cumplimiento de mis atletas',
  '🦴 ¿Qué atletas tienen lesiones o sobrecarga articular reportada?',
  '🥗 ¿Quiénes tienen déficit de proteína o calorías hoy?',
  '💡 Sugiere una mejora de estímulo para mis atletas con baja adherencia',
];

export function ClinicalAgentTerminal({
  trainerId,
  trainerName,
}: ClinicalAgentTerminalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadHistory = useCallback(async () => {
    if (!trainerId) return;
    setFetchingHistory(true);
    try {
      const res = await clinicalAgentService.getHistory(trainerId);
      if (res?.data) {
        setMessages(res.data);
      }
    } catch {
      // Ignore background error
    } finally {
      setFetchingHistory(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [trainerId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await clinicalAgentService.sendMessage(trainerId, query);
      const replyContent =
        res?.data?.reply || 'Respuesta generada por el Director Clínico.';

      const tempAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: replyContent,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempAiMsg]);
    } catch {
      toast.error('No se pudo comunicar con el Director Clínico IA');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('¿Deseas reiniciar la memoria del chat clínico?')) return;
    try {
      await clinicalAgentService.clearHistory(trainerId);
      setMessages([]);
      toast.success('Memoria reiniciada');
    } catch {
      toast.error('Error al limpiar la conversación');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[900px] w-full rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0B0D14] via-[#080A0F] to-[#040508] shadow-2xl overflow-hidden relative backdrop-blur-2xl">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Terminal Header ── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">
                Director Clínico IA
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
            </div>
            <p className="text-[11px] font-semibold text-white/40">
              Cerebro Omnisciente · Leyes Biomecánicas de Vital Fit
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          title="Limpiar memoria"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 transition-all cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* ── Quick Prompts Strip ── */}
      <div className="relative z-10 px-6 py-2.5 border-b border-white/5 bg-black/20 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400/80 shrink-0 flex items-center gap-1">
          <Zap className="h-3 w-3" /> Consultas Rápidas:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="shrink-0 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 hover:text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ── Messages Stream ── */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-6 py-6 space-y-5"
      >
        {fetchingHistory ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center max-w-md mx-auto py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <Sparkles className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-black text-white">
              Director Clínico a tus órdenes, {trainerName}
            </h4>
            <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
              Tengo cargado en memoria el historial clínico, lesiones, ingesta nutricional y rutinas activas de todos tus atletas. Pregúntame por banderas rojas o pídeme modificar una rutina.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-3 max-w-3xl',
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold',
                    isUser
                      ? 'bg-primary-500/20 border-primary-500/30 text-primary-300'
                      : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                  )}
                >
                  {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                {(() => {
                  let proposalData: RoutineProposal | null = null;
                  const proposalMatch = msg.content.match(/\[PROPUESTA_RUTINA:\s*(\{[\s\S]*?\})\]/);
                  if (proposalMatch) {
                    try {
                      proposalData = JSON.parse(proposalMatch[1]);
                    } catch {
                      // ignore parse errors
                    }
                  }

                  const cleanText = msg.content
                    .replace(/\[PROPUESTA_RUTINA:[\s\S]*?\]/g, '')
                    .replace(/\[COMANDO_RUTINA:[\s\S]*?\]/g, '')
                    .replace(/\(ID:\s*[0-9a-f-]{10,}\)/gi, '')
                    .trim();

                  return (
                    <div
                      className={cn(
                        'rounded-2xl px-5 py-4 text-xs leading-relaxed max-w-full',
                        isUser
                          ? 'bg-primary-500/15 border border-primary-500/25 text-white font-medium'
                          : 'bg-[#151922] border border-white/10 text-slate-100 shadow-md'
                      )}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap font-sans">{cleanText}</div>
                      ) : (
                        <>
                          <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-2">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-sm font-black text-cyan-400 mt-2.5 mb-1 uppercase tracking-wider">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xs font-black text-cyan-300 mt-2 mb-1 uppercase tracking-wider">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-xs font-bold text-amber-300 mt-3 mb-1.5 uppercase tracking-wide border-b border-white/5 pb-1 flex items-center gap-1.5">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="text-slate-200 text-xs leading-relaxed my-1.5">
                                    {children}
                                  </p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-white tracking-wide">
                                    {children}
                                  </strong>
                                ),
                                ul: ({ children }) => (
                                  <ul className="space-y-1.5 my-2 pl-1 list-none">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="space-y-1.5 my-2 pl-4 list-decimal text-slate-300">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="flex items-start gap-2 text-slate-300">
                                    <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                                    <div className="flex-1">{children}</div>
                                  </li>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="my-2 rounded-xl border-l-4 border-emerald-500 bg-emerald-500/10 px-3.5 py-2 text-[11px] font-medium text-emerald-300">
                                    {children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {cleanText}
                            </ReactMarkdown>
                          </div>

                          {/* Interactive Clinical Routine Proposal Diff Card */}
                          {proposalData && (
                            <ClinicalRoutineProposalCard
                              proposal={proposalData}
                              trainerId={trainerId}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            );
          })
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mr-auto"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-xs text-cyan-400 font-semibold flex items-center gap-2">
              <span>Analizando datos fisiológicos y biomecánica...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Input Bar ── */}
      <div className="relative z-10 p-4 border-t border-white/5 bg-black/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5 rounded-2xl bg-white/[0.03] border border-white/10 p-1.5 focus-within:border-cyan-500/50 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Escribe tu consulta o comando (Ej. Cambia la sentadilla de Carlos por prensa 45°)..."
            className="flex-1 bg-transparent px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black transition-all active:scale-95 disabled:opacity-40 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
