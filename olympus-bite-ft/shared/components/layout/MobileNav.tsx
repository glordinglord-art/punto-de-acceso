"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  LogOut,
  X,
  CreditCard,
  Building2,
  Users,
  LayoutDashboard,
  Dumbbell,
  Utensils,
  CheckSquare,
  Activity,
  BarChart3,
  User,
  Sparkles,
  MoreHorizontal,
  Shield,
} from "lucide-react";
import { cn } from "../../lib/utils";

const Icons = {
  home: <LayoutDashboard className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  routines: <Dumbbell className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  meals: <Utensils className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  tasks: <CheckSquare className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  admin: <Activity className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  branches: <Building2 className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  trainers: <Users className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  clients: <Users className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  summary: <BarChart3 className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  exercises: <Dumbbell className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  finances: <CreditCard className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  profile: <User className="h-[22px] w-[22px] sm:h-6 sm:w-6" />,
  clinicalAgent: <Sparkles className="h-[22px] w-[22px] sm:h-6 sm:w-6 text-cyan-400" />,
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

function getNavConfig(activeMode: string) {
  if (activeMode === "superadmin") {
    const bar: NavItem[] = [
      { href: "/admin", label: "Mando", icon: Icons.admin },
      { href: "/admin/branches", label: "Sedes", icon: Icons.branches },
      { href: "/admin/trainers", label: "Equipos", icon: Icons.trainers },
      { href: "/admin/finances", label: "Cuentas", icon: Icons.finances },
    ];

    const moreModules: NavItem[] = [
      {
        href: "/clinical-agent",
        label: "Asistente IA",
        icon: Icons.clinicalAgent,
        description: "Asistente deportivo y planificación inteligente",
      },
      {
        href: "/profile",
        label: "Mi Perfil",
        icon: Icons.profile,
        description: "Seguridad y cuenta de administrador",
      },
    ];

    return { bar, moreModules };
  }

  if (activeMode === "trainer") {
    const bar: NavItem[] = [
      { href: "/dashboard", label: "Inicio", icon: Icons.home },
      { href: "/clients", label: "Atletas", icon: Icons.clients },
      { href: "/routines", label: "Rutinas", icon: Icons.routines },
      { href: "/exercises", label: "Ejercicios", icon: Icons.exercises },
    ];

    const moreModules: NavItem[] = [
      {
        href: "/clinical-agent",
        label: "Co-Piloto IA",
        icon: Icons.clinicalAgent,
        description: "Gestión de volumen MEV-MAV-MRV y cambios en vivo",
      },
      {
        href: "/meals",
        label: "Agua y Comidas",
        icon: Icons.meals,
        description: "Seguimiento nutricional de tus atletas",
      },
      {
        href: "/finances",
        label: "Mis Cuentas",
        icon: Icons.finances,
        description: "Pagos de atletas y balances",
      },
      {
        href: "/profile",
        label: "Mi Perfil",
        icon: Icons.profile,
        description: "Datos y configuración de entrenador",
      },
    ];

    return { bar, moreModules };
  }

  // Client / Athlete Mode — Fitia Style 4 Core Modules
  const bar: NavItem[] = [
    { href: "/dashboard", label: "Plan", icon: Icons.home },
    { href: "/routines", label: "Rutina", icon: Icons.routines },
    { href: "/progress", label: "Progreso", icon: Icons.summary },
    { href: "/profile", label: "Coach", icon: Icons.profile },
  ];

  const moreModules: NavItem[] = [];

  return { bar, moreModules };
}

function MoreMenu({
  pathname,
  moreModules,
}: {
  pathname: string;
  moreModules: NavItem[];
}) {
  const { user, activeMode, setActiveMode, availableModes, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasActiveChild = moreModules.some((item) => pathname === item.href);
  const canSwitchRole = availableModes.length > 1;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (pathname !== lastPathname.current) {
      lastPathname.current = pathname;
      const timer = setTimeout(() => setOpen(false), 0);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const modeLabels: Record<
    string,
    { label: string; emoji: string; desc: string }
  > = {
    client: {
      label: "Modo Atleta",
      emoji: "⚡",
      desc: "Tu plan diario, calorías y rutina",
    },
    trainer: {
      label: "Modo Entrenador",
      emoji: "🏋️",
      desc: "Gestión de atletas, rutinas y dietas",
    },
    superadmin: {
      label: "Modo Super Admin",
      emoji: "👑",
      desc: "Centro de mando, sedes y finanzas",
    },
  };

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center justify-center w-full min-w-0"
    >
      {open && (
        <div
          className="fixed inset-0 z-[65] bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-sm max-h-[82vh] flex flex-col rounded-[28px] border border-white/12 bg-[#12141a]/98 shadow-[0_24px_64px_rgba(0,0,0,0.95)] backdrop-blur-2xl p-4 animate-in slide-in-from-bottom-3 duration-200 overflow-hidden">
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="min-w-0 pr-2">
              <span className="font-display font-black uppercase tracking-wider text-white text-sm block truncate">
                {user?.name || "Vital Fit Labs"}
              </span>
              <p className="text-[11px] text-cyan-400 font-medium truncate">
                {canSwitchRole
                  ? "Selector de Rol y Herramientas"
                  : "Herramientas adicionales"}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center transition border border-white/10 active:scale-95 shrink-0 cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Switcher (Top priority on mobile when user has permissions) */}
          {canSwitchRole && (
            <div className="relative z-10 py-3 border-b border-white/[0.08]">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">
                Cambiar Rol Activo ({availableModes.length} permisos)
              </p>
              <div className="space-y-1.5">
                {availableModes.map((mode) => {
                  const info = modeLabels[mode] || {
                    label: mode,
                    emoji: "🔹",
                    desc: "",
                  };
                  const isCurrent = activeMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setActiveMode(mode, true);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2.5 rounded-2xl p-2.5 text-left transition-all border cursor-pointer active:scale-[0.98]",
                        isCurrent
                          ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                          : "bg-[#090b10] border-white/[0.06] text-neutral-300 hover:border-white/20 hover:text-white",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">{info.emoji}</span>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-xs font-black uppercase tracking-wider truncate",
                              isCurrent ? "text-slate-950" : "text-white",
                            )}
                          >
                            {info.label}
                          </p>
                          <p
                            className={cn(
                              "text-[10px] truncate",
                              isCurrent
                                ? "text-slate-800 font-semibold"
                                : "text-neutral-500",
                            )}
                          >
                            {info.desc}
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-black/15 text-[9px] font-black uppercase shrink-0">
                          Activo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Modules */}
          {moreModules.length > 0 && (
            <div className="relative z-10 flex-1 overflow-y-auto py-3 space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                Módulos del Rol
              </p>
              {moreModules.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl p-2.5 transition text-left group border active:scale-[0.98]",
                      isActive
                        ? "bg-white/[0.1] border-white/20 text-white shadow-sm"
                        : "bg-[#090b10] hover:bg-white/[0.06] text-neutral-300 border-white/[0.06]",
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition border",
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-white/[0.05] text-neutral-400 border-white/10 group-hover:text-white",
                      )}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider truncate">
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Logout Button */}
          <div className="relative z-10 pt-3 border-t border-white/[0.08] mt-1">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider transition active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button ("Modo / Más") */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-2xl w-full py-2 sm:py-2.5 px-1 min-h-[56px] transition-all duration-150 relative cursor-pointer active:scale-95 select-none overflow-hidden",
          hasActiveChild || open
            ? "text-cyan-400"
            : "text-neutral-400 hover:text-white",
        )}
        aria-label="Cambiar rol o ver más opciones"
      >
        {open && (
          <div className="absolute inset-x-1 sm:inset-x-1.5 inset-y-1 rounded-2xl bg-amber-400/12 border border-amber-400/30 pointer-events-none" />
        )}

        <div className="relative transition-transform duration-150">
          {canSwitchRole && moreModules.length === 0 ? (
            <Shield className="h-[22px] w-[22px] sm:h-6 sm:w-6 text-amber-400" />
          ) : (
            <MoreHorizontal className="h-[22px] w-[22px] sm:h-6 sm:w-6" />
          )}

          {canSwitchRole && (
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
          )}
        </div>

        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight truncate max-w-full text-center leading-none relative z-10">
          {canSwitchRole && moreModules.length === 0 ? "Modo" : "Más"}
        </span>
      </button>
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { activeMode, availableModes } = useAuth();
  const config = getNavConfig(activeMode);
  const showMoreMenu =
    config.moreModules.length > 0 || availableModes.length > 1;

  return (
    <nav className="fixed bottom-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.25rem))] left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] max-w-md z-50 rounded-[28px] border border-white/[0.14] bg-[#090b10]/96 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl lg:hidden">
      <div className="grid grid-flow-col auto-cols-fr items-center p-1.5 sm:p-2 relative z-10 w-full">
        {config.bar.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl w-full py-2 sm:py-2.5 px-1 min-h-[56px] transition-all duration-150 relative active:scale-95 select-none overflow-hidden",
                isActive
                  ? "text-white"
                  : "text-neutral-400 hover:text-neutral-200 active:text-white",
              )}
            >
              {isActive && (
                <div className="absolute inset-x-1 sm:inset-x-1.5 inset-y-1 rounded-2xl bg-white/[0.09] border border-white/12 shadow-[0_2px_10px_rgba(0,0,0,0.5)] pointer-events-none" />
              )}

              <div
                className={cn(
                  "relative z-10 transition-transform duration-150",
                  isActive
                    ? "text-cyan-400 scale-105"
                    : "text-neutral-400",
                )}
              >
                {item.icon}
              </div>

              <span
                className={cn(
                  "text-[10px] sm:text-[11px] font-black uppercase tracking-tight truncate max-w-full text-center leading-none relative z-10",
                  isActive ? "text-white font-black" : "text-neutral-400",
                )}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="absolute bottom-1 h-1 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.9)]" />
              )}
            </Link>
          );
        })}

        {showMoreMenu && (
          <MoreMenu pathname={pathname} moreModules={config.moreModules} />
        )}
      </div>
    </nav>
  );
}
