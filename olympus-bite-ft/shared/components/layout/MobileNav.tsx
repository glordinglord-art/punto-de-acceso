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
} from "lucide-react";
import { cn } from "../../lib/utils";

// ─── Icons ───────────────────────────────────────────────
const Icons = {
  home: <LayoutDashboard className="h-5 w-5" />,
  routines: <Dumbbell className="h-5 w-5" />,
  meals: <Utensils className="h-5 w-5" />,
  tasks: <CheckSquare className="h-5 w-5" />,
  admin: <Activity className="h-5 w-5" />,
  branches: <Building2 className="h-5 w-5" />,
  trainers: <Users className="h-5 w-5" />,
  clients: <Users className="h-5 w-5" />,
  summary: <BarChart3 className="h-5 w-5" />,
  exercises: <Dumbbell className="h-5 w-5" />,
  finances: <CreditCard className="h-5 w-5" />,
  profile: <User className="h-5 w-5" />,
  clinicalAgent: <Sparkles className="h-5 w-5 text-primary-400" />,
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

// ─── Navigation Configuration per Role (No Duplication) ───────
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
      { href: "/meals", label: "Agua/Comida", icon: Icons.meals },
    ];

    const moreModules: NavItem[] = [
      {
        href: "/clinical-agent",
        label: "Co-Piloto IA",
        icon: Icons.clinicalAgent,
        description: "Gestión de volumen MEV-MAV-MRV y cambios en vivo",
      },
      {
        href: "/exercises",
        label: "Banco de Ejercicios",
        icon: Icons.exercises,
        description: "Catálogo de ejercicios y videos técnicos",
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

  // Client / Athlete Mode — 100% focused on Daily Habits (Zero Bloat)
  const bar: NavItem[] = [
    { href: "/dashboard", label: "Hoy", icon: Icons.home },
    { href: "/routines", label: "Mi Rutina", icon: Icons.routines },
    { href: "/meals", label: "Agua/Comida", icon: Icons.meals },
    { href: "/profile", label: "Mi Perfil", icon: Icons.profile },
  ];

  const moreModules: NavItem[] = [];

  return { bar, moreModules };
}

// ─── "More" Action Sheet ──────────────────────────
function MoreMenu({
  pathname,
  moreModules,
}: {
  pathname: string;
  moreModules: NavItem[];
}) {
  const { activeMode, setActiveMode, availableModes, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasActiveChild = moreModules.some((item) => pathname === item.href);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on route change
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (pathname !== lastPathname.current) {
      lastPathname.current = pathname;
      const timer = setTimeout(() => setOpen(false), 0);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div ref={ref} className="relative flex flex-col items-center flex-1 w-full">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[65] bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating Action Sheet */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-[70] w-72 sm:w-84 max-w-[calc(100vw-32px)] max-h-[78vh] flex flex-col rounded-[28px] border border-white/10 bg-[#0d0f17]/95 shadow-[0_24px_64px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl p-4 animate-in slide-in-from-bottom-4 duration-250 overflow-hidden">
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <span className="font-display font-bold uppercase tracking-wider text-white text-sm">
                Más Módulos
              </span>
              <p className="text-[11px] text-neutral-400 font-medium">
                Herramientas adicionales
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center transition border border-white/10 active:scale-95"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of Modules */}
          {moreModules.length > 0 && (
            <div className="relative z-10 flex-1 overflow-y-auto py-3 space-y-1.5 custom-scrollbar">
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
                        : "bg-white/[0.03] hover:bg-white/[0.07] text-neutral-300 border-white/[0.06] hover:border-white/15"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition border",
                        isActive
                          ? "bg-primary-500/20 text-primary-300 border-primary-500/40"
                          : "bg-white/[0.06] text-neutral-400 border-white/10 group-hover:text-white"
                      )}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider truncate">
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

          {/* Mode Switcher */}
          {availableModes.length > 1 && (
            <div className="relative z-10 pt-3 border-t border-white/[0.08] mt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Cambiar Vista
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {availableModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setOpen(false);
                      setActiveMode(mode, true);
                    }}
                    className={cn(
                      "rounded-xl py-2 px-2.5 text-xs font-semibold uppercase tracking-wider transition text-center border active:scale-95",
                      activeMode === mode
                        ? "bg-white text-black border-white shadow-sm font-bold"
                        : "bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                    )}
                  >
                    {mode === "client" ? "Atleta" : mode === "trainer" ? "Coach" : "Admin"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="relative z-10 pt-3 border-t border-white/[0.08] mt-2">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold uppercase tracking-wider transition active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button ("Más") */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-2xl w-full py-2.5 transition relative cursor-pointer active:scale-95",
          hasActiveChild || open
            ? "text-primary-400"
            : "text-neutral-400 hover:text-white"
        )}
        aria-label="Más opciones"
      >
        <MoreHorizontal className="h-5 w-5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Más
        </span>
      </button>
    </div>
  );
}

// ─── Main Nav Bar (Obsidian Frosted Titanium Capsule) ───────────
export function MobileNav() {
  const pathname = usePathname();
  const { activeMode } = useAuth();
  const config = getNavConfig(activeMode);

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-md rounded-[26px] border border-white/10 bg-[#0a0c12]/85 shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl lg:hidden pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around p-1.5 relative z-10">
        {config.bar.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl flex-1 py-2 px-1 transition-all duration-200 relative active:scale-95",
                isActive
                  ? "text-white"
                  : "text-neutral-400 hover:text-neutral-200 active:text-white"
              )}
            >
              {/* Subtle Concentric Active Pill */}
              {isActive && (
                <div className="absolute inset-x-1.5 inset-y-1 rounded-xl bg-white/[0.08] border border-white/10 shadow-sm" />
              )}

              <div
                className={cn(
                  "relative z-10 transition-transform duration-200",
                  isActive ? "text-primary-400 -translate-y-0.5" : "text-neutral-400"
                )}
              >
                {item.icon}
              </div>

              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider relative z-10 transition-colors",
                  isActive ? "text-white font-black" : "text-neutral-400"
                )}
              >
                {item.label}
              </span>

              {/* Minimalist Active Micro-Indicator */}
              {isActive && (
                <div className="absolute bottom-1 h-1 w-3 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
              )}
            </Link>
          );
        })}

        {/* More Menu (Only when there are additional modules) */}
        {config.moreModules.length > 0 && (
          <MoreMenu pathname={pathname} moreModules={config.moreModules} />
        )}
      </div>
    </nav>
  );
}
