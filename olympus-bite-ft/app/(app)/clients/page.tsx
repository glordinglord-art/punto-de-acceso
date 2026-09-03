"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { formatDate, cn } from "@/shared/lib/utils";
import { FITNESS_GOALS } from "@/features/meals/types/meals.types";
import { Activity, Dumbbell, ShieldAlert, HeartPulse, Link2, Key, Users, Search, ArrowUpDown, ChevronLeft, ChevronRight, UserCircle, Ruler } from "lucide-react";
import { useConfirm } from "@/shared/contexts/ConfirmContext";
import { toast } from "react-hot-toast";

interface InvCode {
  id: string;
  code: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function ClientsPage() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [existingCodes, setExistingCodes] = useState<InvCode[]>([]);
  const [showCodesPanel, setShowCodesPanel] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [selectedClientTab, setSelectedClientTab] = useState<"profile" | "assessments" | "progress" | "compliance" | "ai">("profile");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");

  // Pagination & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name_asc" | "name_desc">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  // Client filtering, sorting and pagination logic
  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return result;
  }, [clients, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedClients.length / ITEMS_PER_PAGE) || 1;

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedClients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

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
    data: { dietaryGoal?: string; targetCalories?: number | null; password?: string },
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
          loading ? "CARGANDO..." : `${clients.length} ${clients.length === 1 ? 'CLIENTE TOTAL' : 'CLIENTES TOTALES'}`
        }
        action={
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowLinkModal(true)}
              variant="secondary"
              size="sm"
              className="font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5"
            >
              <Link2 className="w-3.5 h-3.5 mr-1.5 text-neutral-400" /> Vincular
            </Button>
            <Button
              onClick={handleShowCodes}
              variant="secondary"
              size="sm"
              className="font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5"
            >
              <Key className="w-3.5 h-3.5 mr-1.5 text-neutral-400" /> Códigos
            </Button>
            <Button
              onClick={handleGenerateCode}
              size="sm"
              loading={codeLoading}
              variant="primary"
              className="col-span-2 sm:col-auto font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5 shadow-md shadow-red-500/20"
            >
              + Nuevo Cliente
            </Button>
          </div>
        }
      />

      {/* Toolbar: Search and Filter */}
      {!loading && clients.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-1.5 w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-neutral-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "name_asc" | "name_desc")}
                className="bg-transparent text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none w-full cursor-pointer"
              >
                <option value="recent">Más Recientes</option>
                <option value="name_asc">Nombre (A-Z)</option>
                <option value="name_desc">Nombre (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
      ) : paginatedClients.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 p-12 text-center dark:border-white/10 mt-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
          <Search className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-condensed font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            No hay resultados
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            No se encontraron clientes que coincidan con &quot;{searchQuery}&quot;
          </p>
          <Button variant="ghost" onClick={() => setSearchQuery("")} className="mt-4 font-condensed uppercase tracking-wider font-bold">
            Limpiar Búsqueda
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {paginatedClients.map((client) => {
              const hasCondition = Boolean(client.medicalConditions && client.medicalConditions.trim().toLowerCase() !== "no");
              const hasDietPref = Boolean(client.dietaryPreferences && client.dietaryPreferences.trim().toLowerCase() !== "no");

              return (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setSelectedClientTab("profile");
                  }}
                  className="group flex flex-col gap-4 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 sm:p-5 transition-all hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/5 cursor-pointer backdrop-blur-sm relative overflow-hidden"
                >
                  {/* Left accent indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top: Avatar, Name, Email, Active Status and Objective Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <Avatar name={client.name} size="lg" className="w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-white dark:ring-neutral-800 shadow-md text-lg" />
                        <div className="absolute bottom-0 right-0">
                          <div className={cn(
                            "w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900",
                            client.isActive ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-red-500"
                          )} />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white truncate">
                            {client.name}
                          </h3>
                          <Badge variant={client.isActive ? "success" : "danger"} className="text-[10px] px-2 py-0.5">
                            {client.isActive ? "ACTIVO" : "INACTIVO"}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                          {client.email}
                        </p>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                          Alta: {formatDate(client.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Stats: Goal & Calories */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-black/30 border border-neutral-200 dark:border-white/5 text-center">
                        <span className="text-[9px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block leading-tight">
                          Objetivo
                        </span>
                        <span className="text-xs font-bold text-neutral-800 dark:text-white capitalize">
                          {client.dietaryGoal
                            ? FITNESS_GOALS[client.dietaryGoal as keyof typeof FITNESS_GOALS]?.label || client.dietaryGoal
                            : "--"}
                        </span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-black/30 border border-neutral-200 dark:border-white/5 text-center">
                        <span className="text-[9px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block leading-tight">
                          Macros
                        </span>
                        <span className="text-xs font-bold text-red-500 font-mono">
                          {client.targetCalories ? `${client.targetCalories} kcal` : "--"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Pills (Experience & Equipment) */}
                  {(client.experienceLevel || client.equipmentAccess) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {client.experienceLevel && (
                        <span className="inline-flex items-center rounded-lg bg-neutral-100 dark:bg-white/5 px-2.5 py-1 text-xs font-condensed font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
                          <Dumbbell className="w-3 h-3 mr-1.5 text-red-500" /> {client.experienceLevel}
                        </span>
                      )}
                      {client.equipmentAccess && (
                        <span className="inline-flex items-center rounded-lg bg-neutral-100 dark:bg-white/5 px-2.5 py-1 text-xs font-condensed font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
                          <Activity className="w-3 h-3 mr-1.5 text-white" /> {client.equipmentAccess}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Medical Conditions & Dietary Restrictions (VISIBLE ON MOBILE & DESKTOP!) */}
                  {(hasCondition || hasDietPref) ? (
                    <div className="space-y-1.5">
                      {hasCondition && (
                        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                          <HeartPulse className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                          <span className="leading-snug">
                            <strong className="font-bold uppercase tracking-wider font-condensed">Condición / Lesión:</strong> {client.medicalConditions}
                          </span>
                        </div>
                      )}
                      {hasDietPref && (
                        <div className="flex items-start gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-xl">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                          <span className="leading-snug">
                            <strong className="font-bold uppercase tracking-wider font-condensed">Dieta / Alergia:</strong> {client.dietaryPreferences}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-neutral-500 font-condensed uppercase tracking-wider py-1 px-3 bg-neutral-50 dark:bg-white/[0.02] border border-dashed border-neutral-200 dark:border-white/5 rounded-xl w-fit">
                      ✓ Sin restricciones o lesiones reportadas
                    </div>
                  )}

                  {/* Bottom: Action Buttons for Trainer */}
                  <div className="grid grid-cols-2 sm:flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-white/5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setSelectedClientTab("profile");
                      }}
                      className="font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5"
                    >
                      <UserCircle className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                      Ver Perfil
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setSelectedClientTab("assessments");
                      }}
                      className="font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5 text-white"
                    >
                      <Ruler className="w-3.5 h-3.5 mr-1 text-red-500" />
                      Valoraciones
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setSelectedClientTab("compliance");
                      }}
                      className="col-span-2 sm:col-auto font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5 shadow-md shadow-red-500/20"
                    >
                      <Activity className="w-3.5 h-3.5 mr-1 text-white" />
                      Rendimiento & % (4/4)
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Mostrando <span className="font-bold text-neutral-900 dark:text-white">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-bold text-neutral-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedClients.length)}</span> de <span className="font-bold text-neutral-900 dark:text-white">{filteredAndSortedClients.length}</span> clientes
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1 px-3 bg-neutral-50 dark:bg-black/20 rounded-xl font-condensed font-bold">
                  {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
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
        initialTab={selectedClientTab}
        onClose={() => setSelectedClient(null)}
        onSave={handleSaveProfile}
        onDelete={async (clientId) => {
          const ok = await confirm({
            title: '¿Eliminar cliente?',
            description: 'Se borrarán sus rutinas, comidas y datos permanentemente. Esta acción no se puede deshacer.',
            confirmText: 'Eliminar cliente',
            variant: 'danger',
          });
          if (!ok) return;
          try {
            await clientsService.deleteClient(clientId);
            setSelectedClient(null);
            await loadClients();
            toast.success('Cliente eliminado exitosamente');
          } catch (err) {
            toast.error('Error eliminando cliente: ' + (err instanceof Error ? err.message : 'Error'));
          }
        }}
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
