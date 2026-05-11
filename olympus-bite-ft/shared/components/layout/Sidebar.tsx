"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSettings } from "@/shared/contexts/SettingsContext";
import { cn } from "../../lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  trainerOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
  trainerOnly?: boolean;
};

const navGroups: NavGroup[] = [
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
                  ? "bg-primary-500 text-slate-950 border-primary-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                  : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
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
        className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
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
                  ? "bg-primary-500 text-slate-950 border-primary-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                  : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
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
  const { logout, user, isTrainer } = useAuth();
  const { layout } = useSettings();

  const filteredGroups = navGroups
    .filter((group) => !group.trainerOnly || isTrainer)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.trainerOnly || isTrainer),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "hidden lg:bg-[#0f1115] lg:transition-all lg:z-30 lg:flex",
        layout === "mini"
          ? "flex-row items-center fixed top-0 left-0 w-full h-20 px-6 border-b border-white/5"
          : "flex-col w-72 fixed inset-y-0 border-r border-white/5"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-4",
          layout === "mini"
            ? "h-full border-none pr-8 border-r border-white/5"
            : "h-24 px-6 border-b border-white/5"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-slate-950 shadow-[0_0_20px_rgba(234,88,12,0.4)]">
          <span className="text-xl font-black italic tracking-tighter">OB</span>
        </div>
        <div>
          <h1 className="text-lg font-black italic text-white tracking-tight uppercase leading-none">
            OLYMPUS
            <span className="block text-primary-500">BITE</span>
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          layout === "mini"
            ? "flex-1 flex items-center gap-6 px-8"
            : "flex-1 px-4 py-8 overflow-y-auto scrollbar-hide"
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
            ? "pr-6 border-l border-white/5 pl-8"
            : "border-t border-white/5 p-6 flex-col"
        )}
      >
        {user && layout !== "mini" && (
          <div className="mb-4 px-2 w-full text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-white truncate">
              {user.name}
            </p>
            <p className="text-xs font-semibold text-slate-500 truncate mt-1">{user.email}</p>
          </div>
        )}
        <button
          className={cn(
            "flex items-center justify-center gap-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border",
            layout === "mini"
              ? "p-3 text-slate-400 bg-white/5 border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
              : "w-full py-3.5 text-slate-400 bg-white/5 border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
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
