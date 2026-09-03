"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSettings } from "@/shared/contexts/SettingsContext";
import { VitalFitLogo } from "@/shared/components/ui/VitalFitLogo";
import { cn } from "../../lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  trainerOnly?: boolean;
  superAdminOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
  trainerOnly?: boolean;
  superAdminOnly?: boolean;
};

const navGroups: NavGroup[] = [
  {
    title: "Super Admin",
    superAdminOnly: true,
    items: [
      {
        href: "/admin",
        label: "Centro de Mando",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        href: "/admin/branches",
        label: "Sedes & Gyms",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        href: "/admin/trainers",
        label: "Entrenadores",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        href: "/admin/finances",
        label: "Cuentas & Finanzas",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        href: "/profile",
        label: "Perfil",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Mi Plan",
    items: [
      {
        href: "/routines",
        label: "Rutinas",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
      },
      {
        href: "/meals",
        label: "Comidas",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        ),
      },
      {
        href: "/tasks",
        label: "Tareas",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Administración",
    trainerOnly: true,
    items: [
      {
        href: "/clients",
        label: "Clientes",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        ),
      },
      {
        href: "/exercises",
        label: "Ejercicios",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 10v4M17 10v4M4 8v8M20 8v8" />
          </svg>
        ),
      },
      {
        href: "/summary",
        label: "Resumen Global",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
      {
        href: "/finances",
        label: "Mis Cuentas",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
      },
    ],
  },
];

function SidebarGroup({ group, pathname, layout }: { group: NavGroup; pathname: string; layout: string }) {
  const [isOpen, setIsOpen] = useState(true);

  if (layout === "mini") {
    return (
      <div className="flex items-center gap-2">
        {group.items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 border",
                isActive
                  ? "bg-primary-500/12 text-primary-600 border-primary-500/25 shadow-sm shadow-primary-500/20 dark:text-primary-400 dark:border-primary-500/20 dark:shadow-md dark:shadow-primary-500/20"
                  : "bg-slate-900/5 text-slate-600 border-slate-200/80 hover:bg-slate-900/10 hover:text-slate-950 dark:bg-white/5 dark:text-slate-400 dark:border-white/5 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              <div className="w-5 h-5">{item.icon}</div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-6 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-950 dark:hover:text-white"
      >
        <span>{group.title}</span>
        <svg
          className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "rotate-180" : "")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        className={cn(
          "space-y-1 overflow-hidden transition-all duration-300 origin-top",
          isOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
      >
        {group.items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 border",
                isActive
                  ? "bg-primary-500/12 text-primary-600 border-primary-500/25 shadow-sm shadow-primary-500/20 dark:text-primary-400 dark:border-primary-500/20 dark:shadow-md dark:shadow-primary-500/20"
                  : "bg-transparent text-slate-600 border-transparent hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              <div className="w-5 h-5">{item.icon}</div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user, activeMode, setActiveMode, availableModes, isSuperAdmin, isTrainer } = useAuth();
  const { layout } = useSettings();

  const filteredGroups = navGroups
    .filter((group) => {
      if (group.superAdminOnly) return activeMode === 'superadmin';
      if (group.trainerOnly) return activeMode === 'trainer';
      if (group.title === 'Mi Plan' && activeMode === 'superadmin') return false;
      return true;
    })
    .map((group) => ({
      ...group,
      title: group.title === 'Mi Plan' && activeMode === 'trainer' ? 'Planes & Dietas' : group.title,
      items: group.items.filter((item) => {
        if (item.superAdminOnly) return activeMode === 'superadmin';
        if (item.trainerOnly) return activeMode === 'trainer';
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  const getRoleBadge = () => {
    if (isSuperAdmin) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400">
          👑 Super Admin
        </span>
      );
    }
    if (isTrainer) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-primary-500/15 border border-primary-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">
          🏋️ Entrenador
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400">
        ⚡ Atleta
      </span>
    );
  };

  return (
    <aside
      className={cn(
        "hidden lg:bg-white/90 lg:text-slate-950 lg:backdrop-blur-xl lg:transition-all lg:z-30 lg:flex dark:lg:bg-[#0f1115] dark:lg:text-white",
        layout === "mini"
          ? "flex-row items-center fixed top-0 left-0 w-full h-20 px-6 border-b border-slate-200/80 dark:border-white/5"
          : "flex-col w-72 fixed inset-y-0 border-r border-slate-200/80 dark:border-white/5"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center",
          layout === "mini"
            ? "h-full border-none pr-6 border-r border-slate-200/80 dark:border-white/5"
            : "h-24 px-6 border-b border-slate-200/80 dark:border-white/5 justify-start"
        )}
      >
        <Link href="/dashboard" className="flex items-center group transition-transform hover:scale-[1.02]">
          <VitalFitLogo size={layout === "mini" ? "sm" : "md"} showGlow={true} glowIntensity="medium" />
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          layout === "mini"
            ? "flex-1 flex items-center gap-6 px-8"
            : "flex-1 px-4 py-6 overflow-y-auto scrollbar-hide"
        )}
      >
        {filteredGroups.map((group) => (
          <SidebarGroup
            key={group.title}
            group={group}
            pathname={pathname}
            layout={layout}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div
        className={cn(
          "flex items-center gap-4",
          layout === "mini"
            ? "pr-6 border-l border-slate-200/80 pl-8 dark:border-white/5"
            : "border-t border-slate-200/80 p-6 flex-col dark:border-white/5"
        )}
      >
        {user && layout !== "mini" && (
          <div className="mb-2 px-2 w-full text-center">
            <div className="mb-2 flex justify-center">{getRoleBadge()}</div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-900 truncate dark:text-white">
              {user.name}
            </p>
            <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{user.email}</p>
            
            {/* Mode Switcher */}
            {availableModes.length > 1 && (
              <div className="mt-4 flex flex-col gap-1">
                {availableModes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all",
                      activeMode === mode
                        ? "bg-primary-500/10 text-primary-500 border-primary-500/20"
                        : "bg-transparent text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-300"
                    )}
                  >
                    Modo {mode === 'client' ? 'Atleta' : mode === 'trainer' ? 'Entrenador' : 'Super Admin'}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          className={cn(
            "flex items-center justify-center gap-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border",
            layout === "mini"
              ? "p-3 text-slate-500 bg-slate-900/5 border-slate-200/80 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 dark:text-slate-400 dark:bg-white/5 dark:border-white/5 dark:hover:text-red-400"
              : "w-full py-3 text-slate-500 bg-slate-900/5 border-slate-200/80 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 dark:text-slate-400 dark:bg-white/5 dark:border-white/5 dark:hover:text-red-400"
          )}
          onClick={logout}
          title="Cerrar sesión"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {layout !== "mini" && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
