"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Avatar } from "@/shared/components/ui/Avatar";
import { adminService } from "@/features/admin/services/admin.service";
import type { TrainerRosterItem, TrainerLink } from "@/features/admin/types/admin.types";
import { Link2, ArrowRightLeft, ArrowRight, Unlink, Sparkles, Check, Users, Target } from "lucide-react";
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
  const [scope, setScope] = useState<"all" | "specific">("all");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
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
      setScope("all");
      setSelectedClientIds([]);
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

  const trainerA = trainers.find((t) => t.id === trainerAId);
  const trainerB = trainers.find((t) => t.id === trainerBId);

  // Available clients that can be selected depending on mode
  const availableClients = useMemo(() => {
    const list: Array<{ id: string; name: string; email: string; avatarUrl?: string | null; trainerName: string }> = [];
    if (trainerA) {
      trainerA.clients.forEach((c) => {
        list.push({ ...c, trainerName: trainerA.name });
      });
    }
    if (mode === "bidirectional" && trainerB) {
      trainerB.clients.forEach((c) => {
        list.push({ ...c, trainerName: trainerB.name });
      });
    }
    return list;
  }, [trainerA, trainerB, mode]);

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

    if (scope === "specific" && selectedClientIds.length === 0) {
      toast.error("Selecciona al menos un atleta o elige 'Todos los Atletas'");
      return;
    }

    setLoading(true);
    try {
      const clientsToSend = scope === "specific" ? selectedClientIds : [];
      const res = await adminService.linkTrainers(trainerAId, trainerBId, null, mode, clientsToSend);
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
            Vincula entrenadores para que compartan sus atletas de forma <strong>Mutua (ambos se ven)</strong> o de <strong>1 solo sentido</strong>, eligiendo si comparten <strong>todos sus atletas</strong> o solo <strong>algunos específicos</strong>.
          </div>
        </div>

        {/* Link Form */}
        <form onSubmit={handleLink} className="space-y-5">
          {/* Mode Selector: Mutuo vs 1 Sentido */}
          <div className="space-y-2">
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              1. Tipo de Enlace
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Bidirectional */}
              <button
                type="button"
                onClick={() => setMode("bidirectional")}
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer",
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
                  Ambos entrenadores comparten sus atletas recíprocamente.
                </p>
              </button>

              {/* Option 2: Unidirectional */}
              <button
                type="button"
                onClick={() => setMode("unidirectional")}
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer",
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
                onChange={(e) => {
                  setTrainerAId(e.target.value);
                  setSelectedClientIds([]);
                }}
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
                onChange={(e) => {
                  setTrainerBId(e.target.value);
                  setSelectedClientIds([]);
                }}
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

          {/* 2. Scope Selector: Todos vs Específicos */}
          <div className="space-y-2">
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              2. ¿Qué atletas deseas compartir?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setScope("all");
                  setSelectedClientIds([]);
                }}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer",
                  scope === "all"
                    ? "border-red-500 bg-red-500/15 ring-1 ring-red-500 text-white shadow-sm"
                    : "border-neutral-200 dark:border-white/10 bg-white dark:bg-black/30 text-neutral-300 hover:border-neutral-400"
                )}
              >
                <div>
                  <span className="font-bold text-xs font-condensed uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-red-500" />
                    Todos los Atletas
                  </span>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Comparte la cartera completa (actuales y nuevos)
                  </span>
                </div>
                {scope === "all" && <Check className="w-4 h-4 text-red-500 shrink-0 ml-2" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setScope("specific");
                  if (selectedClientIds.length === 0) {
                    setSelectedClientIds(availableClients.map((c) => c.id));
                  }
                }}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer",
                  scope === "specific"
                    ? "border-red-500 bg-red-500/15 ring-1 ring-red-500 text-white shadow-sm"
                    : "border-neutral-200 dark:border-white/10 bg-white dark:bg-black/30 text-neutral-300 hover:border-neutral-400"
                )}
              >
                <div>
                  <span className="font-bold text-xs font-condensed uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-red-500" />
                    Solo Atletas Específicos
                  </span>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Selecciona manualmente cuáles usuarios compartir
                  </span>
                </div>
                {scope === "specific" && <Check className="w-4 h-4 text-red-500 shrink-0 ml-2" />}
              </button>
            </div>
          </div>

          {/* Specific Athletes Selection Checklist */}
          {scope === "specific" && (
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
                  Selecciona los Atletas ({selectedClientIds.length} de {availableClients.length} marcados)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClientIds(availableClients.map((c) => c.id))}
                    className="text-[11px] font-condensed font-bold uppercase text-red-400 hover:underline cursor-pointer"
                  >
                    Marcar Todos
                  </button>
                  <span className="text-neutral-600">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedClientIds([])}
                    className="text-[11px] font-condensed font-bold uppercase text-neutral-400 hover:underline cursor-pointer"
                  >
                    Desmarcar
                  </button>
                </div>
              </div>

              {availableClients.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-3 text-center">
                  El entrenador seleccionado no tiene atletas registrados aún.
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {availableClients.map((client) => {
                    const isChecked = selectedClientIds.includes(client.id);
                    return (
                      <label
                        key={client.id}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer",
                          isChecked
                            ? "bg-red-500/10 border-red-500/40 text-white"
                            : "bg-white dark:bg-white/[0.02] border-neutral-200 dark:border-white/5 text-neutral-400 hover:border-neutral-300"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClientIds((prev) => [...prev, client.id]);
                              } else {
                                setSelectedClientIds((prev) => prev.filter((id) => id !== client.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-white/20 text-red-600 focus:ring-red-500/40 cursor-pointer"
                          />
                          <Avatar name={client.name} src={client.avatarUrl ?? undefined} size="sm" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                              {client.name}
                            </p>
                            <p className="text-[10px] text-neutral-500 truncate">
                              {client.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] font-condensed uppercase font-bold px-2 py-0.5 rounded-md bg-white/5 text-neutral-400 border border-white/5 shrink-0 ml-2">
                          Coach: {client.trainerName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Visual dynamic helper explaining the exact result */}
          {trainerA && trainerB && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-400 text-center font-medium">
              {mode === "bidirectional" ? (
                <span>
                  🔄 <strong className="text-white">{trainerA.name}</strong> y{" "}
                  <strong className="text-white">{trainerB.name}</strong> compartirán{" "}
                  <strong className="text-red-400">
                    {scope === "all" ? "todos sus atletas" : `${selectedClientIds.length} atletas seleccionados`}
                  </strong>{" "}
                  mutuamente.
                </span>
              ) : (
                <span>
                  ➡️ <strong className="text-white">{trainerB.name}</strong> tendrá acceso a{" "}
                  <strong className="text-red-400">
                    {scope === "all" ? "todos los atletas" : `${selectedClientIds.length} atletas seleccionados`}
                  </strong>{" "}
                  de <strong className="text-white">{trainerA.name}</strong>.
                </span>
              )}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="font-condensed uppercase tracking-wider font-bold py-3 shadow-lg shadow-red-500/25 cursor-pointer"
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
                const hasSpecific = link.sharedClientIds && link.sharedClientIds.length > 0;
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
                          <ArrowRight className="w-3 h-3" /> 1 Sentido
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold font-condensed uppercase px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                          <ArrowRightLeft className="w-3 h-3" /> Mutuo
                        </span>
                      )}

                      <span className="font-bold text-neutral-900 dark:text-white">
                        {link.trainerB?.name || "Coach B"}
                      </span>

                      <span className="text-[10px] font-condensed uppercase px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                        {hasSpecific ? `🎯 ${link.sharedClientIds!.length} específicos` : "👥 Todos"}
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
