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
import { Activity, Dumbbell, ShieldAlert, HeartPulse, Link2, Key, Users, Search, ArrowUpDown, ChevronLeft, ChevronRight, UserCircle, Ruler, Moon, Scale, TrendingUp, Sparkles } from "lucide-react";
import { useConfirm } from "@/shared/contexts/ConfirmContext";
import { toast } from "react-hot-toast";

interface InvCode {
  id: string;
  code: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}

interface AthleteTriageInfo {
  sleepScoreStr: string;
  sleepCompliedCount: number;
  sleepStatus: "optimal" | "warning" | "critical" | "unknown";
  lastWeightStr: string;
  weightDeltaStr: string;
  weightStatus: "optimal" | "warning" | "critical" | "unknown";
  lastReportWeek: number | null;
  reportPending: boolean;
  globalStatus: "optimal" | "warning" | "critical";
  statusBadge: {
    label: string;
    color: string;
    bg: string;
    border: string;
  };
}

function computeAthleteTriage(client: User): AthleteTriageInfo {
  const anamnesis =
    client.anamnesisData && typeof client.anamnesisData === "object"
      ? (client.anamnesisData as any)
      : {};
  const sleepLogs: any[] = Array.isArray(anamnesis.sleepLogs)
    ? anamnesis.sleepLogs
    : [];
  const fastedWeighIns: any[] = Array.isArray(anamnesis.fastedWeighIns)
    ? anamnesis.fastedWeighIns
    : [];
  const weeklyReports: any[] = Array.isArray(anamnesis.weeklyReports)
    ? anamnesis.weeklyReports
    : [];

  // 1. Sueño Circadiano (Últimos 7 días)
  const recentSleep = sleepLogs.slice(-7);
  const sleepCompliedCount = recentSleep.filter(
    (s) => s.withinOneHourWindow,
  ).length;
  let sleepStatus: "optimal" | "warning" | "critical" | "unknown" = "unknown";
  if (recentSleep.length > 0) {
    if (sleepCompliedCount >= 5) sleepStatus = "optimal";
    else if (sleepCompliedCount >= 3) sleepStatus = "warning";
    else sleepStatus = "critical";
  }

  // 2. Pesaje en Ayunas
  const lastWeighIn =
    fastedWeighIns.length > 0
      ? fastedWeighIns[fastedWeighIns.length - 1]
      : null;
  let weightStatus: "optimal" | "warning" | "critical" | "unknown" = "unknown";
  let lastWeightStr = client.weight ? `${client.weight} kg` : "--";
  let weightDeltaStr = "";

  if (lastWeighIn) {
    lastWeightStr = `${lastWeighIn.weightKg} kg`;
    const daysAgo = Math.floor(
      (Date.now() -
        new Date(lastWeighIn.date || lastWeighIn.createdAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysAgo <= 7) weightStatus = "optimal";
    else if (daysAgo <= 14) weightStatus = "warning";
    else weightStatus = "critical";

    if (lastWeighIn.deltaKg !== undefined && lastWeighIn.deltaKg !== null) {
      const d = Number(lastWeighIn.deltaKg);
      weightDeltaStr = d > 0 ? `(+${d}kg)` : `(${d}kg)`;
    }
  }

  // 3. Reporte Semanal
  const lastReport =
    weeklyReports.length > 0
      ? weeklyReports[weeklyReports.length - 1]
      : null;
  const lastReportWeek = lastReport ? Number(lastReport.weekNumber) : null;
  let reportPending = false;
  if (lastReport) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastReport.publishedAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysSince > 7) reportPending = true;
  } else {
    reportPending = true;
  }

  // 4. Semáforo Global
  let globalStatus: "optimal" | "warning" | "critical" = "optimal";
  if (sleepStatus === "critical" || weightStatus === "critical") {
    globalStatus = "critical";
  } else if (
    reportPending ||
    sleepStatus === "warning" ||
    weightStatus === "warning"
  ) {
    globalStatus = "warning";
  } else if (sleepStatus === "unknown" && weightStatus === "unknown") {
    globalStatus = "warning";
  }

  let statusBadge = {
    label: "🟢 En Zona Óptima",
    color: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
  };

  if (globalStatus === "critical") {
    statusBadge = {
      label: "🔴 Atención Requerida",
      color: "text-rose-300",
      bg: "bg-rose-500/15",
      border: "border-rose-500/30",
    };
  } else if (globalStatus === "warning") {
    statusBadge = {
      label: reportPending ? "🟡 Reporte Pendiente" : "🟡 Atención Media",
      color: "text-amber-300",
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
    };
  }

  return {
    sleepScoreStr:
      recentSleep.length > 0
        ? `${sleepCompliedCount}/7 días`
        : "Sin datos",
    sleepCompliedCount,
    sleepStatus,
    lastWeightStr,
    weightDeltaStr,
    weightStatus,
    lastReportWeek,
    reportPending,
    globalStatus,
    statusBadge,
  };
}

export default function ClientsPage() {
  const { user, updateUser } = useAuth();
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
  const [selectedClientTab, setSelectedClientTab] = useState<"pact" | "assessments" | "progress" | "compliance" | "ai" | "evolution">("pact");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");

  // Pagination & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name_asc" | "name_desc">("recent");
  const [triageFilter, setTriageFilter] = useState<"all" | "critical" | "pending_report" | "optimal">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loadClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const fallbackSelf: User = {
      ...user,
      avatarUrl: null,
      phone: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    try {
      const [res, selfRes] = await Promise.all([
        clientsService.getByTrainer(user.id).catch(() => ({ data: [] as User[] })),
        clientsService.getById(user.id).catch(() => ({ data: fallbackSelf })),
      ]);
      const list = res.data ?? [];
      const selfUser: User = selfRes.data ?? fallbackSelf;
      const withoutSelf = list.filter((c) => c.id !== user.id);
      setClients([selfUser, ...withoutSelf]);
    } catch {
      setClients([fallbackSelf]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Conteo rápido para el Semáforo de Triage
  const triageCounts = useMemo(() => {
    let critical = 0;
    let pendingReport = 0;
    let optimal = 0;
    clients.forEach((c) => {
      const t = computeAthleteTriage(c);
      if (t.globalStatus === "critical") critical++;
      if (t.reportPending) pendingReport++;
      if (t.globalStatus === "optimal") optimal++;
    });
    return {
      all: clients.length,
      critical,
      pendingReport,
      optimal,
    };
  }, [clients]);

  // Client filtering, sorting and pagination logic
  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    // Filtro por Semáforo
    if (triageFilter === "critical") {
      result = result.filter(
        (c) => computeAthleteTriage(c).globalStatus === "critical",
      );
    } else if (triageFilter === "pending_report") {
      result = result.filter(
        (c) => computeAthleteTriage(c).reportPending,
      );
    } else if (triageFilter === "optimal") {
      result = result.filter(
        (c) => computeAthleteTriage(c).globalStatus === "optimal",
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (user && a.id === user.id) return -1;
      if (user && b.id === user.id) return 1;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return result;
  }, [clients, triageFilter, searchQuery, sortBy, user]);

  const totalPages = Math.ceil(filteredAndSortedClients.length / ITEMS_PER_PAGE) || 1;

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedClients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, triageFilter]);

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
      if (user && clientId === user.id) {
        updateUser({
          ...user,
          dietaryGoal: data.dietaryGoal !== undefined ? (data.dietaryGoal as User["dietaryGoal"]) : user.dietaryGoal,
          targetCalories: data.targetCalories !== undefined ? data.targetCalories : user.targetCalories,
        });
      }
      toast.success("Perfil actualizado correctamente");
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
        title="Mis Atletas"
        subtitle={
          loading ? "CARGANDO..." : `${clients.length} ${clients.length === 1 ? 'ATLETA ACTIVO' : 'ATLETAS EN SEGUIMIENTO'}`
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
              + Nuevo Atleta
            </Button>
          </div>
        }
      />

      {/* ── SEMÁFORO GENERAL DEL ENTRENADOR (TRIAGE EN VIVO) ── */}
      {!loading && clients.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
          <button
            type="button"
            onClick={() => setTriageFilter("all")}
            className={cn(
              "p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between",
              triageFilter === "all"
                ? "bg-white/10 border-white/40 shadow-md text-white font-black"
                : "bg-white/[0.02] border-white/10 text-neutral-400 hover:border-white/20 hover:text-white",
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              Todos los Atletas
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-black font-mono text-white">
                {triageCounts.all}
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">Total</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTriageFilter("critical")}
            className={cn(
              "p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between",
              triageFilter === "critical"
                ? "bg-rose-500/20 border-rose-500/60 shadow-md shadow-rose-500/10 text-rose-200 font-black"
                : "bg-rose-500/5 border-rose-500/20 text-rose-400/80 hover:bg-rose-500/10",
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-300">
                🚨 Requieren Atención
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-black font-mono text-rose-200">
                {triageCounts.critical}
              </span>
              <span className="text-[10px] text-rose-300/80 font-medium">Sueño o Pesaje</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTriageFilter("pending_report")}
            className={cn(
              "p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between",
              triageFilter === "pending_report"
                ? "bg-amber-500/20 border-amber-500/60 shadow-md shadow-amber-500/10 text-amber-200 font-black"
                : "bg-amber-500/5 border-amber-500/20 text-amber-400/80 hover:bg-amber-500/10",
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-300">
                📞 Reporte Pendiente
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-black font-mono text-amber-200">
                {triageCounts.pendingReport}
              </span>
              <span className="text-[10px] text-amber-300/80 font-medium">Por publicar</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTriageFilter("optimal")}
            className={cn(
              "p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between",
              triageFilter === "optimal"
                ? "bg-emerald-500/20 border-emerald-500/60 shadow-md shadow-emerald-500/10 text-emerald-200 font-black"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400/80 hover:bg-emerald-500/10",
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-300">
                🟢 En Zona Óptima
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-black font-mono text-emerald-200">
                {triageCounts.optimal}
              </span>
              <span className="text-[10px] text-emerald-300/80 font-medium">100% al día</span>
            </div>
          </button>
        </div>
      )}

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
              const anamnesis =
                client.anamnesisData && typeof client.anamnesisData === "object"
                  ? (client.anamnesisData as any)
                  : {};
              const pact = anamnesis.heroPact || {};
              const bioObj = pact.objectives?.biometric;
              const strObj = pact.objectives?.strength;
              const masObj = pact.objectives?.bodyMastery;
              const aerObj = pact.objectives?.aerobic;
              const macrocycleMap = pact.macrocycleMap;
              const waterTarget =
                pact.pillars?.nutrition?.waterLitersTarget ||
                Number((((client.weight || 72) * 35 + 500) / 1000).toFixed(1));
              const sleepTarget = `${pact.pillars?.recovery?.targetBedtime || "22:30"} - ${pact.pillars?.recovery?.targetWakeTime || "06:00"}`;
              const triage = computeAthleteTriage(client);

              return (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setSelectedClientTab("pact");
                  }}
                  className="group flex flex-col gap-4 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 sm:p-5 transition-all hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/5 cursor-pointer backdrop-blur-sm relative overflow-hidden"
                >
                  {/* Left accent indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top: Avatar, Name, Email, Active Status and 3 Pillars Summary */}
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
                          {user && client.id === user.id && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                              🏋️ Tú (Entrenador)
                            </span>
                          )}
                          <Badge variant={client.isActive ? "success" : "danger"} className="text-[10px] px-2 py-0.5">
                            {client.isActive ? "ACTIVO" : "INACTIVO"}
                          </Badge>
                          <Badge variant={anamnesis.cycleStatus === "ACTIVE_CYCLE" ? "success" : "warning"} className="text-[10px] px-2 py-0.5">
                            {anamnesis.cycleStatus === "ACTIVE_CYCLE" ? "CICLO 120D ACTIVO" : "POR CALIBRAR PACTO"}
                          </Badge>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                              triage.statusBadge.bg,
                              triage.statusBadge.border,
                              triage.statusBadge.color,
                            )}
                          >
                            {triage.statusBadge.label}
                          </span>
                          {macrocycleMap && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                              🗺️ Macrociclo Activo
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                          {client.email}
                        </p>
                      </div>
                    </div>

                    {/* 3 Pilares del Atleta */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-black/30 border border-neutral-200 dark:border-white/5 text-center">
                        <span className="text-[9px] font-condensed font-bold uppercase tracking-wider text-amber-400 block leading-tight">
                          🔥 Energía & Proteína
                        </span>
                        <span className="text-xs font-bold text-neutral-800 dark:text-white font-mono">
                          {client.targetCalories || pact.pillars?.nutrition?.calories || 2200} kcal · {client.targetProtein || pact.pillars?.nutrition?.protein || 150}g P
                        </span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-black/30 border border-neutral-200 dark:border-white/5 text-center">
                        <span className="text-[9px] font-condensed font-bold uppercase tracking-wider text-sky-400 block leading-tight">
                          💧 Agua Meta
                        </span>
                        <span className="text-xs font-bold text-sky-300 font-mono">
                          {waterTarget} L/día
                        </span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-black/30 border border-neutral-200 dark:border-white/5 text-center">
                        <span className="text-[9px] font-condensed font-bold uppercase tracking-wider text-indigo-400 block leading-tight">
                          🌙 Sueño (±1h)
                        </span>
                        <span className="text-xs font-bold text-indigo-300 font-mono">
                          {sleepTarget}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── SEMÁFORO DE TELEMETRÍA EN VIVO (VITAL FIT LABS) ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-2xl bg-black/40 border border-white/5">
                    {/* Sueño Circadiano */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.02]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sueño Circadiano:
                      </span>
                      <span
                        className={cn(
                          "text-xs font-mono font-bold",
                          triage.sleepStatus === "optimal"
                            ? "text-emerald-400"
                            : triage.sleepStatus === "warning"
                              ? "text-amber-400"
                              : triage.sleepStatus === "critical"
                                ? "text-rose-400"
                                : "text-neutral-500",
                        )}
                      >
                        {triage.sleepScoreStr}
                      </span>
                    </div>

                    {/* Pesaje en Ayunas */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.02]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-emerald-400" /> Pesaje en Ayunas:
                      </span>
                      <span
                        className={cn(
                          "text-xs font-mono font-bold",
                          triage.weightStatus === "optimal"
                            ? "text-emerald-400"
                            : triage.weightStatus === "warning"
                              ? "text-amber-400"
                              : triage.weightStatus === "critical"
                                ? "text-rose-400"
                                : "text-neutral-500",
                        )}
                      >
                        {triage.lastWeightStr} {triage.weightDeltaStr}
                      </span>
                    </div>

                    {/* Reporte Semanal */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.02]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-400" /> Reporte Mentor:
                      </span>
                      <span
                        className={cn(
                          "text-xs font-bold",
                          triage.reportPending ? "text-amber-400" : "text-emerald-400",
                        )}
                      >
                        {triage.lastReportWeek
                          ? `Sem ${triage.lastReportWeek} al día`
                          : "Semana 1 Pendiente"}
                      </span>
                    </div>
                  </div>

                  {/* Las 4 Metas de 120 Días del Atleta */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-white/10">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        1. Meta Biométrica
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {bioObj?.currentWeightKg || client.weight || "--"} kg ➔ {bioObj?.targetWeightKg || "--"} kg
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-white/10">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-red-400">
                        2. Meta de Fuerza
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white truncate block">
                        {strObj?.exerciseName ? `${strObj.exerciseName}: ${strObj.targetWeight || "--"}kg` : "Por definir en Ficha"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-white/10">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-400">
                        3. Dominio Corporal
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white truncate block">
                        {masObj?.skillName ? `${masObj.skillName} (${masObj.targetMark || ""})` : "Por definir en Ficha"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-white/10">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-sky-400">
                        4. Meta Aeróbica
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white truncate block">
                        {aerObj?.targetMark ? `${aerObj.metricName || "Cardio"}: ${aerObj.targetMark}` : "Por definir en Ficha"}
                      </span>
                    </div>
                  </div>

                  {/* Medical Conditions & Dietary Restrictions */}
                  {(hasCondition || hasDietPref) && (
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
                  )}

                  {/* Bottom: Action Buttons for Trainer */}
                  <div className="grid grid-cols-2 sm:flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-white/5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setSelectedClientTab("pact");
                      }}
                      className="font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5"
                    >
                      <UserCircle className="w-3.5 h-3.5 mr-1 text-red-400" />
                      🎯 4 Metas y Ficha
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setSelectedClientTab("evolution");
                      }}
                      className="font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5 text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
                    >
                      <TrendingUp className="w-3.5 h-3.5 mr-1 text-amber-400" />
                      📈 Mi Progreso (Cargas)
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setSelectedClientTab("ai");
                      }}
                      className="font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5 text-cyan-300 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20"
                    >
                      🔒 Memoria Clínica IA
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
                      <Ruler className="w-3.5 h-3.5 mr-1 text-amber-400" />
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
                      className="font-condensed uppercase tracking-wider font-bold text-xs justify-center py-2.5 shadow-md shadow-red-500/20"
                    >
                      <Activity className="w-3.5 h-3.5 mr-1 text-white" />
                      📞 Reporte Semanal
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
        onUpdated={(updatedUser: User) => {
          setSelectedClient(updatedUser);
          setClients((prev) =>
            prev.map((c) => (c.id === updatedUser.id ? updatedUser : c)),
          );
        }}
        onDelete={selectedClient?.id === user?.id ? undefined : async (clientId) => {
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
