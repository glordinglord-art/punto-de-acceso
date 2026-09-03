"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Avatar } from "@/shared/components/ui/Avatar";
import { adminService } from "@/features/admin/services/admin.service";
import type { TrainerRosterItem, TrainerLink } from "@/features/admin/types/admin.types";
import { Link2, ArrowRightLeft, ArrowRight, Unlink, Sparkles, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/shared/lib/utils";

interface LinkTrainersModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainers: TrainerRosterItem[];
  onSuccess?: () => void;
  initialTrainerAId?: string;
}

export function LinkTrainersModal({
  isOpen,
  onClose,
  trainers,
  onSuccess,
  initialTrainerAId,
}: LinkTrainersModalProps) {
  const [trainerAId, setTrainerAId] = useState<string>("");
  const [trainerBId, setTrainerBId] = useState<string>("");
  const [mode, setMode] = useState<"bidirectional" | "unidirectional">("bidirectional");
  const [loading, setLoading] = useState(false);
  const [linksLoading, setLinksLoading] = useState(false);
  const [activeLinks, setActiveLinks] = useState<TrainerLink[]>([]);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const loadLinks = async () => {
    setLinksLoading(true);
    try {
      const res = await adminService.getTrainerLinks();
      if (res.data) {
        setActiveLinks(res.data);
      }
    } catch {
      setActiveLinks([]);
    } finally {
      setLinksLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLinks();
      if (initialTrainerAId) {
        setTrainerAId(initialTrainerAId);
        const other = trainers.find((t) => t.id !== initialTrainerAId);
        if (other) setTrainerBId(other.id);
      } else if (trainers.length >= 2) {
        setTrainerAId(trainers[0].id);
        setTrainerBId(trainers[1].id);
      }
    }
  }, [isOpen, trainers, initialTrainerAId]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerAId || !trainerBId) {
      toast.error("Selecciona ambos entrenadores");
      return;
    }
    if (trainerAId === trainerBId) {
      toast.error("Selecciona dos entrenadores diferentes");
      return;
    }

    setLoading(true);
    try {
      const res = await adminService.linkTrainers(trainerAId, trainerBId, null, mode);
      toast.success(res.message || "¡Enlace configurado con éxito!");
      await loadLinks();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enlazar");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (linkId: string) => {
    setUnlinkingId(linkId);
    try {
      await adminService.unlinkTrainers(linkId);
      toast.success("Enlace eliminado con éxito");
      await loadLinks();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al desvincular");
    } finally {
      setUnlinkingId(null);
    }
  };

  const trainerA = trainers.find((t) => t.id === trainerAId);
  const trainerB = trainers.find((t) => t.id === trainerBId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enlazar y Compartir Atletas entre Coaches">
      <div className="space-y-6">
        {/* Banner Explaining Feature */}
        <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/20 text-xs text-neutral-300 leading-relaxed flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white uppercase tracking-wider mb-1 font-condensed text-sm">
              Gestión de Cartera Compartida
            </p>
            Puedes vincular entrenadores para que compartan sus atletas de forma <strong>Mutua (ambos se ven)</strong> o de <strong>1 solo sentido (Dani le comparte a Juan, pero Dani no ve los de Juan)</strong>.
          </div>
        </div>

        {/* Link Form */}
        <form onSubmit={handleLink} className="space-y-5">
          {/* Mode Selector: Mutuo vs 1 Sentido */}
          <div className="space-y-2">
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Tipo de Enlace / Compartición
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Bidirectional */}
              <button
                type="button"
                onClick={() => setMode("bidirectional")}
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between",
                  mode === "bidirectional"
                    ? "border-red-500 bg-red-500/15 ring-1 ring-red-500 shadow-md shadow-red-500/10"
                    : "border-neutral-200 dark:border-white/10 bg-white dark:bg-black/30 hover:border-neutral-400"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold text-sm text-neutral-900 dark:text-white font-condensed uppercase tracking-wider">
                    <ArrowRightLeft className="w-4 h-4 text-red-500" />
                    Enlace Múltiple (Mutuo)
                  </span>
                  {mode === "bidirectional" && <Check className="w-4 h-4 text-red-500" />}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Ambos entrenadores comparten y gestionan todos sus atletas recíprocamente.
                </p>
              </button>

              {/* Option 2: Unidirectional */}
              <button
                type="button"
                onClick={() => setMode("unidirectional")}
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between",
                  mode === "unidirectional"
                    ? "border-red-500 bg-red-500/15 ring-1 ring-red-500 shadow-md shadow-red-500/10"
                    : "border-neutral-200 dark:border-white/10 bg-white dark:bg-black/30 hover:border-neutral-400"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold text-sm text-neutral-900 dark:text-white font-condensed uppercase tracking-wider">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    Enlace de 1 Sentido (Unidireccional)
                  </span>
                  {mode === "unidirectional" && <Check className="w-4 h-4 text-red-500" />}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  El Coach 1 le comparte sus atletas al Coach 2, pero no al revés.
                </p>
              </button>
            </div>
          </div>

          {/* Trainer Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Trainer A */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/40">
              <label className="block text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-400 mb-2">
                {mode === "unidirectional" ? "Coach 1 (Quien Comparte)" : "Entrenador 1 (Coach A)"}
              </label>
              <select
                value={trainerAId}
                onChange={(e) => setTrainerAId(e.target.value)}
                className="w-full py-2.5 px-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
              >
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.clients.length} atletas)
                  </option>
                ))}
              </select>

              {trainerA && (
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                  <Avatar name={trainerA.name} src={trainerA.avatarUrl ?? undefined} size="sm" />
                  <div>
                    <p className="font-bold text-neutral-800 dark:text-neutral-200">{trainerA.name}</p>
                    <p className="text-[10px] text-neutral-500">{trainerA.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Trainer B */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/40">
              <label className="block text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-400 mb-2">
                {mode === "unidirectional" ? "Coach 2 (Quien Recibe Acceso)" : "Entrenador 2 (Coach B)"}
              </label>
              <select
                value={trainerBId}
                onChange={(e) => setTrainerBId(e.target.value)}
                className="w-full py-2.5 px-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
              >
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.clients.length} atletas)
                  </option>
                ))}
              </select>

              {trainerB && (
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                  <Avatar name={trainerB.name} src={trainerB.avatarUrl ?? undefined} size="sm" />
                  <div>
                    <p className="font-bold text-neutral-800 dark:text-neutral-200">{trainerB.name}</p>
                    <p className="text-[10px] text-neutral-500">{trainerB.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visual dynamic helper explaining the exact result */}
          {trainerA && trainerB && (
            <div className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-400 text-center font-medium">
              {mode === "bidirectional" ? (
                <span>
                  🔄 <strong className="text-white">{trainerA.name}</strong> y{" "}
                  <strong className="text-white">{trainerB.name}</strong> verán los atletas del otro mutuamente.
                </span>
              ) : (
                <span>
                  ➡️ <strong className="text-white">{trainerB.name}</strong> podrá ver los atletas de{" "}
                  <strong className="text-white">{trainerA.name}</strong>, pero {trainerA.name} no verá los de {trainerB.name}.
                </span>
              )}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="font-condensed uppercase tracking-wider font-bold py-3 shadow-lg shadow-red-500/25"
          >
            {mode === "bidirectional" ? (
              <>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Vincular en Modo Mutuo (Múltiple)
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Vincular en Modo 1 Solo Sentido
              </>
            )}
          </Button>
        </form>

        {/* Existing Active Links */}
        <div className="pt-4 border-t border-neutral-200 dark:border-white/10">
          <h4 className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-red-500" />
            Enlaces Activos ({activeLinks.length})
          </h4>

          {linksLoading ? (
            <div className="h-16 animate-pulse rounded-xl bg-neutral-100 dark:bg-white/5" />
          ) : activeLinks.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-2">
              No hay entrenadores enlazados actualmente. Configura un enlace arriba para compartir atletas.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activeLinks.map((link) => {
                const isUnidir = link.mode === "unidirectional";
                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {link.trainerA?.name || "Coach A"}
                      </span>

                      {isUnidir ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold font-condensed uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <ArrowRight className="w-3 h-3" /> Solo 1 Sentido
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold font-condensed uppercase px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                          <ArrowRightLeft className="w-3 h-3" /> Mutuo
                        </span>
                      )}

                      <span className="font-bold text-neutral-900 dark:text-white">
                        {link.trainerB?.name || "Coach B"}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      loading={unlinkingId === link.id}
                      onClick={() => handleUnlink(link.id)}
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-400 text-xs px-2.5 py-1 font-condensed uppercase shrink-0"
                    >
                      <Unlink className="w-3.5 h-3.5 mr-1" /> Desvincular
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
