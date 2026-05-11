const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'olympus-bite-ft/app/(app)/clients/page.tsx');

const newContent = `"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { Button } from "@/shared/components/ui/Button";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { Modal } from "@/shared/components/ui/Modal";
import { clientsService } from "@/features/clients/services/clients.service";
import { authService } from "@/features/auth/services/auth.service";
import { ClientProfileModal } from "@/features/clients/components/ClientProfileModal";
import type { User } from "@/shared/types/common.types";
import { cn, formatDate } from "@/shared/lib/utils";
import { FITNESS_GOALS } from "@/features/meals/types/meals.types";
import { Activity, Dumbbell, ShieldAlert, HeartPulse, Link2, Key, Users } from "lucide-react";

interface InvCode {
  id: string;
  code: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [existingCodes, setExistingCodes] = useState<InvCode[]>([]);
  const [showCodesPanel, setShowCodesPanel] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");

  const loadClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await clientsService.getByTrainer(user.id);
      setClients(res.data ?? []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleGenerateCode = async () => {
    if (!user) return;
    setCodeLoading(true);
    try {
      const res = await authService.generateCode(user.id);
      setGeneratedCode(res.data.code);
      setShowCodeModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error generando código");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleShowCodes = async () => {
    if (!user) return;
    try {
      const res = await authService.getCodes(user.id);
      setExistingCodes(res.data ?? []);
      setShowCodesPanel(true);
    } catch {
      setExistingCodes([]);
      setShowCodesPanel(true);
    }
  };

  const handleLinkClient = async () => {
    if (!user || !linkEmail.trim()) return;
    setLinkLoading(true);
    setLinkError("");
    try {
      await clientsService.linkClient(user.id, linkEmail.trim());
      setShowLinkModal(false);
      setLinkEmail("");
      await loadClients();
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : "No se encontró ningún usuario con ese email");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleSaveProfile = async (
    clientId: string,
    data: { dietaryGoal?: string; targetCalories?: number | null },
  ) => {
    try {
      await clientsService.updateProfile(clientId, data);
      setClients(
        clients.map((c) =>
          c.id === clientId
            ? {
                ...c,
                dietaryGoal:
                  data.dietaryGoal !== undefined
                    ? data.dietaryGoal
                    : c.dietaryGoal,
                targetCalories:
                  data.targetCalories !== undefined
                    ? data.targetCalories
                    : c.targetCalories,
              }
            : c,
        ),
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Error actualizando el perfil del cliente",
      );
    }
  };

  return (
    <>
      <Header
        title="Gestión de Clientes"
        subtitle={
          loading ? "CARGANDO..." : \`\${clients.length} \${clients.length === 1 ? 'CLIENTE ACTIVO' : 'CLIENTES ACTIVOS'}\`
        }
        action={
          <div className="flex gap-3">
            <Button onClick={() => setShowLinkModal(true)} variant="ghost" size="md" className="font-condensed uppercase tracking-wider font-bold">
              <Link2 className="w-4 h-4 mr-2" /> Vincular
            </Button>
            <Button onClick={handleShowCodes} variant="secondary" size="md" className="font-condensed uppercase tracking-wider font-bold shadow-md">
              <Key className="w-4 h-4 mr-2" /> Códigos
            </Button>
            <Button
              onClick={handleGenerateCode}
              size="md"
              loading={codeLoading}
              className="font-condensed uppercase tracking-wider font-bold shadow-lg shadow-primary-500/20"
            >
              + Nuevo Cliente
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5"
            />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-neutral-200 p-16 text-center dark:border-white/10 mt-8 bg-white/50 dark:bg-black/20 backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-inner">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-condensed font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            Sin Clientes Asignados
          </h3>
          <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            El verdadero entrenamiento comienza ahora. Genera un código de invitación y comienza a guiar a tus clientes hacia la excelencia.
          </p>
          <Button
            onClick={handleGenerateCode}
            className="mt-8 font-condensed uppercase tracking-wider font-bold"
            loading={codeLoading}
            size="lg"
          >
            Generar Código de Acceso
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-6">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="group flex flex-col sm:flex-row gap-5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 transition-all hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow-lg cursor-pointer backdrop-blur-sm relative overflow-hidden"
            >
              {/* Highlight bar on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-4 flex-1">
                <Avatar name={client.name} size="xl" className="ring-2 ring-white dark:ring-black shadow-md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white truncate">
                      {client.name}
                    </h3>
                    <Badge variant={client.isActive ? "success" : "danger"} className="shadow-sm">
                      {client.isActive ? "ACTIVO" : "INACTIVO"}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                    {client.email}
                  </p>

                  {/* Advanced Profile Pills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {client.experienceLevel && (
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-condensed font-bold uppercase tracking-wider text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 shadow-sm">
                        <Dumbbell className="w-3 h-3 mr-1.5" /> {client.experienceLevel}
                      </span>
                    )}
                    {client.equipmentAccess && (
                      <span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-condensed font-bold uppercase tracking-wider text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20 shadow-sm">
                        <Activity className="w-3 h-3 mr-1.5" /> {client.equipmentAccess}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical / Dietary info if any */}
              <div className="hidden lg:flex flex-col justify-center flex-1 max-w-xs border-l border-neutral-100 dark:border-white/5 pl-5">
                {(client.medicalConditions || client.dietaryPreferences) ? (
                  <div className="space-y-2">
                    {client.medicalConditions && (
                      <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-lg border border-amber-100 dark:border-amber-500/20">
                        <HeartPulse className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-tight"><strong className="font-bold">CONDICIÓN:</strong> {client.medicalConditions}</span>
                      </div>
                    )}
                    {client.dietaryPreferences && (
                      <div className="flex items-start gap-2 text-xs text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 p-2 rounded-lg border border-orange-100 dark:border-orange-500/20">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-tight"><strong className="font-bold">DIETA/ALERGIA:</strong> {client.dietaryPreferences}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-400 font-condensed uppercase tracking-wider border border-dashed border-neutral-200 dark:border-white/10 rounded-xl p-2 bg-neutral-50/50 dark:bg-white/5">
                    Sin restricciones
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 shrink-0 items-center justify-items-end xl:justify-items-center bg-neutral-50 dark:bg-black/20 p-4 rounded-xl border border-neutral-100 dark:border-white/5">
                <div className="text-right xl:text-center w-full">
                  <p className="text-[10px] font-condensed font-bold text-neutral-400 uppercase tracking-widest mb-1">Objetivo</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white capitalize">
                    {client.dietaryGoal
                      ? FITNESS_GOALS[
                          client.dietaryGoal as keyof typeof FITNESS_GOALS
                        ]?.label || client.dietaryGoal
                      : "--"}
                  </p>
                </div>

                <div className="text-right xl:text-center w-full">
                  <p className="text-[10px] font-condensed font-bold text-neutral-400 uppercase tracking-widest mb-1">Macros</p>
                  <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {client.targetCalories
                      ? \`\${client.targetCalories} kcal\`
                      : "--"}
                  </p>
                </div>

                <div className="text-right xl:text-center w-full col-span-2 md:col-span-2 xl:col-span-1 border-t md:border-t-0 pt-2 md:pt-0 mt-2 md:mt-0 border-neutral-200 dark:border-white/10">
                  <p className="text-[10px] font-condensed font-bold text-neutral-400 uppercase tracking-widest mb-1">Ingreso</p>
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {formatDate(client.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generated Code Modal */}
      <Modal
        isOpen={showCodeModal}
        onClose={() => {
          setShowCodeModal(false);
          setGeneratedCode(null);
        }}
        title="Código de Acceso"
        size="sm"
      >
        <div className="text-center py-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-500 shadow-inner">
            <Key className="w-10 h-10" />
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Comparte este código seguro con tu nuevo cliente. Le dará acceso directo a tu grupo de entrenamiento.
          </p>
          <div className="rounded-2xl bg-neutral-100 p-5 dark:bg-black/40 border border-neutral-200 dark:border-white/5 shadow-inner">
            <p className="text-4xl font-bold tracking-[0.3em] text-neutral-900 dark:text-white font-mono">
              {generatedCode}
            </p>
          </div>
          <p className="text-[10px] font-condensed font-bold uppercase tracking-widest text-neutral-400 mt-4">
            VÁLIDO POR 7 DÍAS · UN SOLO USO
          </p>
          <Button
            className="mt-6 font-condensed uppercase tracking-wider font-bold shadow-lg shadow-primary-500/20"
            fullWidth
            onClick={() => {
              navigator.clipboard.writeText(generatedCode ?? "");
            }}
          >
            Copiar al Portapapeles
          </Button>
        </div>
      </Modal>

      {/* Existing Codes Modal */}
      <Modal
        isOpen={showCodesPanel}
        onClose={() => setShowCodesPanel(false)}
        title="Códigos Activos"
        size="md"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 pb-2 custom-scrollbar">
          {existingCodes.length === 0 ? (
            <div className="text-center py-10">
              <Key className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <p className="text-sm font-condensed uppercase tracking-wider font-bold text-neutral-400">
                No hay códigos generados
              </p>
            </div>
          ) : (
            existingCodes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-white/10 dark:bg-white/5 transition-colors hover:bg-neutral-100 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-lg font-bold text-neutral-900 dark:text-white tracking-widest">
                    {code.code}
                  </span>
                  <Badge variant={code.isUsed ? "danger" : "success"} className="shadow-sm">
                    {code.isUsed ? "USADO" : "DISPONIBLE"}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-condensed font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Expira</p>
                  <div className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {formatDate(code.expiresAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      <ClientProfileModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onSave={handleSaveProfile}
      />

      {/* Vincular cliente existente */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl dark:bg-neutral-900 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-condensed font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">
              Vincular Cliente
            </h3>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-6">
              Si tu cliente ya tiene cuenta, ingresa su correo electrónico para añadirlo a tu roster.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-condensed font-bold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
                  Correo del Cliente
                </label>
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => { setLinkEmail(e.target.value); setLinkError(""); }}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 px-4 py-3.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-primary-500 dark:focus:bg-black/40 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleLinkClient()}
                  autoFocus
                />
              </div>
              {linkError && (
                <div className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {linkError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button variant="ghost" size="lg" onClick={() => { setShowLinkModal(false); setLinkEmail(""); setLinkError(""); }} className="font-condensed font-bold uppercase tracking-wider">
                Cancelar
              </Button>
              <Button size="lg" onClick={handleLinkClient} loading={linkLoading} disabled={!linkEmail.trim()} className="font-condensed font-bold uppercase tracking-wider shadow-lg shadow-primary-500/20">
                Vincular
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
`;

fs.writeFileSync(filePath, newContent);
console.log('Done replacing clients page.tsx');
