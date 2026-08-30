"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "../../lib/utils";

// ─── Icons ───────────────────────────────────────────────
const Icons = {
  home: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  routines: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  meals: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  tasks: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  admin: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  branches: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  trainers: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  clients: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  summary: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  exercises: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 10v4M17 10v4M4 8v8M20 8v8" />
    </svg>
  ),
  profile: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

// ─── Dynamic Nav Configuration ──────────────────────────────
function getNavConfig(activeMode: string) {
  if (activeMode === 'superadmin') {
    return {
      main: [
        { href: "/admin", label: "Mando", icon: Icons.admin },
        { href: "/admin/branches", label: "Sedes", icon: Icons.branches },
        { href: "/admin/trainers", label: "Equipos", icon: Icons.trainers },
      ],
      overflow: [
        { href: "/profile", label: "Perfil", icon: Icons.profile },
      ],
    };
  }

  if (activeMode === 'trainer') {
    return {
      main: [
        { href: "/dashboard", label: "Inicio", icon: Icons.home },
        { href: "/clients", label: "Clientes", icon: Icons.clients },
        { href: "/routines", label: "Rutinas", icon: Icons.routines },
        { href: "/meals", label: "Dietas", icon: Icons.meals },
      ],
      overflow: [
        { href: "/exercises", label: "Ejercicios", icon: Icons.exercises },
        { href: "/summary", label: "Resumen", icon: Icons.summary },
        { href: "/profile", label: "Perfil", icon: Icons.profile },
      ],
    };
  }

  // Client
  return {
    main: [
      { href: "/dashboard", label: "Inicio", icon: Icons.home },
      { href: "/routines", label: "Rutinas", icon: Icons.routines },
      { href: "/meals", label: "Comidas", icon: Icons.meals },
      { href: "/tasks", label: "Tareas", icon: Icons.tasks },
    ],
    overflow: [
      { href: "/profile", label: "Perfil", icon: Icons.profile },
    ],
  };
}

// ─── "More" button with popover ──────────────────────────
function MoreMenu({ pathname, items }: { pathname: string, items: any[] }) {
  const { activeMode, setActiveMode, availableModes } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasActiveChild = items.some((item) => pathname === item.href);

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
      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Popover panel */}
      {open && (
        <div className="absolute bottom-full mb-3 right-0 z-50 w-52 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_16px_48px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-[#14161a]/95 dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-primary-500/12 text-primary-500 dark:text-primary-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          
          {/* Mode Switcher inside Mobile More Menu */}
          {availableModes.length > 1 && (
            <>
              <div className="my-2 border-t border-slate-200 dark:border-white/10" />
              <div className="px-2 pb-1 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 pl-2">
                  Cambiar Vista
                </p>
                {availableModes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setActiveMode(mode);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                      activeMode === mode
                        ? "bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-500/30"
                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 border border-transparent"
                    )}
                  >
                    Modo {mode === 'client' ? 'Atleta' : mode === 'trainer' ? 'Entrenador' : 'Super Admin'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-2xl w-full py-2 transition-all duration-300 relative",
          hasActiveChild && !open
            ? "text-primary-500"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
        )}
      >
        {hasActiveChild && !open && (
          <div className="absolute inset-x-1 inset-y-0.5 rounded-2xl bg-primary-500/10 border border-primary-500/20" />
        )}
        <div className="relative z-10 transition-transform duration-300">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
        </div>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider relative z-10 transition-all duration-300",
          hasActiveChild ? "opacity-100" : "opacity-70"
        )}>
          Más
        </span>
      </button>
    </div>
  );
}

// ─── Main Nav ─────────────────────────────────────────────
export function MobileNav() {
  const pathname = usePathname();
  const { activeMode } = useAuth();
  const config = getNavConfig(activeMode);

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#0c0d10]/85 dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between p-1.5">
        {config.main.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl flex-1 py-2 transition-all duration-300 relative",
                isActive
                  ? "text-primary-500"
                  : "text-slate-500 active:text-slate-800 dark:active:text-slate-300"
              )}
            >
              {/* Subtle glow background on active */}
              {isActive && (
                <div className="absolute inset-x-1 inset-y-0.5 rounded-2xl bg-primary-500/10 border border-primary-500/15 shadow-[0_0_20px_rgba(16,185,129,0.12)]" />
              )}

              <div className={cn(
                "relative z-10 transition-all duration-300",
                isActive && "-translate-y-0.5"
              )}>
                {item.icon}
              </div>

              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider relative z-10 transition-all duration-300",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <div className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
            </Link>
          );
        })}

        {/* More menu */}
        <MoreMenu pathname={pathname} items={config.overflow} />
      </div>
    </nav>
  );
}
