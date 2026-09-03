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

    // Only modules NOT visible in the bottom bar
    const moreModules: NavItem[] = [
      { href: "/profile", label: "Mi Perfil", icon: Icons.profile, description: "Seguridad y cuenta de administrador" },
    ];

    return { bar, moreModules };
  }

  if (activeMode === "trainer") {
    const bar: NavItem[] = [
      { href: "/dashboard", label: "Inicio", icon: Icons.home },
      { href: "/clients", label: "Clientes", icon: Icons.clients },
      { href: "/routines", label: "Rutinas", icon: Icons.routines },
      { href: "/meals", label: "Dietas", icon: Icons.meals },
    ];

    // Only modules NOT visible in the bottom bar
    const moreModules: NavItem[] = [
      { href: "/tasks", label: "Tareas Diarias", icon: Icons.tasks, description: "Hábitos y control de estrés de atletas" },
      { href: "/exercises", label: "Banco de Ejercicios", icon: Icons.exercises, description: "Catálogo de técnica y biblioteca" },
      { href: "/summary", label: "Resumen Global", icon: Icons.summary, description: "Métricas y cumplimiento general" },
      { href: "/finances", label: "Mis Cuentas", icon: Icons.finances, description: "Pagos de alumnos y balances" },
      { href: "/profile", label: "Mi Perfil", icon: Icons.profile, description: "Datos y configuración de entrenador" },
    ];

    return { bar, moreModules };
  }

  // Client / Athlete Mode
  const bar: NavItem[] = [
    { href: "/dashboard", label: "Inicio", icon: Icons.home },
    { href: "/routines", label: "Rutinas", icon: Icons.routines },
    { href: "/meals", label: "Comidas", icon: Icons.meals },
    { href: "/tasks", label: "Tareas", icon: Icons.tasks },
  ];

  // Only modules NOT visible in the bottom bar
  const moreModules: NavItem[] = [
    { href: "/profile", label: "Mi Perfil", icon: Icons.profile, description: "Mis datos personales y medidas corporales" },
  ];

  return { bar, moreModules };
}

// ─── "More" Liquid Glass Water Action Sheet ──────────────────────────
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
      {/* Liquid Backdrop Blur */}
      {open && (
        <div
          className="fixed inset-0 z-[65] bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── Apple "Modo Agua" Liquid Crystal Glass Sheet ─── */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-[70] w-72 sm:w-80 max-w-[calc(100vw-32px)] max-h-[78vh] flex flex-col rounded-[32px] border border-white/25 bg-neutral-950/80 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(255,255,255,0.08)] backdrop-blur-3xl backdrop-saturate-[220%] p-3.5 animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
          {/* Top Liquid Water Refraction Sheen */}
          <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-t-[32px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 px-1.5">
            <div>
              <span className="font-condensed font-black uppercase tracking-wider text-white text-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                Más Opciones
              </span>
              <p className="text-[10px] text-neutral-400 font-medium">
                Herramientas adicionales de la cuenta
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all border border-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of Remaining Modules (NO DUPLICATES) */}
          <div className="relative z-10 flex-1 overflow-y-auto py-2.5 space-y-1.5 custom-scrollbar pr-1">
            <p className="text-[10px] font-condensed font-bold uppercase tracking-widest text-neutral-400 px-2 pt-0.5 pb-1">
              Módulos Adicionales
            </p>
            {moreModules.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left group border",
                    isActive
                      ? "bg-red-600/25 border-red-500/40 text-white shadow-[0_4px_16px_rgba(239,68,68,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 border-white/10 hover:border-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all border",
                      isActive
                        ? "bg-red-500 text-white border-red-400 shadow-md shadow-red-500/40"
                        : "bg-white/10 text-neutral-300 border-white/10 group-hover:text-white group-hover:bg-white/15"
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-condensed font-bold uppercase tracking-wider truncate">
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

          {/* Mode Switcher with Liquid Capsules */}
          {availableModes.length > 1 && (
            <div className="relative z-10 pt-2.5 border-t border-white/10 mt-1">
              <p className="text-[10px] font-condensed font-bold uppercase tracking-widest text-neutral-400 px-2 mb-1.5">
                Cambiar Vista
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 px-0.5">
                {availableModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setActiveMode(mode);
                      setOpen(false);
                    }}
                    className={cn(
                      "rounded-xl py-2 px-2 text-[10px] font-condensed font-bold uppercase tracking-wider transition-all text-center border backdrop-blur-md",
                      activeMode === mode
                        ? "bg-red-600/90 border-red-400 text-white shadow-[0_4px_16px_rgba(239,68,68,0.4),inset_0_1px_2px_rgba(255,255,255,0.4)]"
                        : "bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                    )}
                  >
                    {mode === "client" ? "Atleta" : mode === "trainer" ? "Coach" : "Admin"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Logout Button (Liquid Red Capsule) */}
          <div className="relative z-10 pt-2.5 border-t border-white/10 mt-2 px-0.5">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-condensed font-bold uppercase tracking-wider transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
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
          "flex flex-col items-center justify-center gap-1 rounded-2xl w-full py-2 transition-all duration-300 relative cursor-pointer",
          hasActiveChild && !open
            ? "text-red-500"
            : "text-slate-400 hover:text-white"
        )}
      >
        <div className="relative z-10 transition-transform duration-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        </div>
        <span
          className={cn(
            "text-[10px] font-condensed font-bold uppercase tracking-wider relative z-10 transition-all duration-300",
            open ? "text-red-500" : "opacity-80"
          )}
        >
          Más
        </span>
      </button>
    </div>
  );
}

// ─── Main Nav Bar (Apple Liquid Water Glassmorphism) ───────────
export function MobileNav() {
  const pathname = usePathname();
  const { activeMode } = useAuth();
  const config = getNavConfig(activeMode);

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-[28px] border border-white/25 bg-black/45 shadow-[0_20px_50px_rgba(0,0,0,0.75),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-1px_1.5px_rgba(255,255,255,0.08)] backdrop-blur-3xl backdrop-saturate-[220%] lg:hidden">
      {/* Top Water Refraction Highlight */}
      <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between p-1.5 relative z-10">
        {config.bar.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl flex-1 py-2 transition-all duration-300 relative",
                isActive ? "text-red-500" : "text-neutral-400 active:text-white"
              )}
            >
              {/* Active Liquid Drop Glow */}
              {isActive && (
                <div className="absolute inset-x-1 inset-y-0.5 rounded-2xl bg-red-500/15 border border-red-500/30 shadow-[0_2px_12px_rgba(239,68,68,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)]" />
              )}

              <div
                className={cn(
                  "relative z-10 transition-all duration-300",
                  isActive && "-translate-y-0.5"
                )}
              >
                {item.icon}
              </div>

              <span
                className={cn(
                  "text-[10px] font-condensed font-bold uppercase tracking-wider relative z-10 transition-all duration-300",
                  isActive ? "opacity-100 font-black text-red-400" : "opacity-70"
                )}
              >
                {item.label}
              </span>

              {/* Water droplet indicator */}
              {isActive && (
                <div className="absolute bottom-0.5 h-1 w-1 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)]" />
              )}
            </Link>
          );
        })}

        {/* More menu with ONLY non-duplicated modules */}
        <MoreMenu pathname={pathname} moreModules={config.moreModules} />
      </div>
    </nav>
  );
}
