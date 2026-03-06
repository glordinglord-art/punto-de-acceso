"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSettings } from "@/shared/contexts/SettingsContext";
import { cn } from "../../lib/utils";

const adminNavItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/meals",
    label: "Comidas",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    ),
  },
  {
    href: "/routines",
    label: "Rutinas",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    href: "/tasks",
    label: "Tareas",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    href: "/clients",
    label: "Clientes",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
    ),
    trainerOnly: true,
  },
  {
    href: "/exercises",
    label: "Ejercicios",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 10h18M7 10v4M17 10v4M4 8v8M20 8v8"
        />
      </svg>
    ),
    trainerOnly: true,
  },
  {
    href: "/profile",
    label: "Perfil",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user, isTrainer } = useAuth();
  const { layout } = useSettings();

  const navItems = adminNavItems.filter(
    (item) => !("trainerOnly" in item && item.trainerOnly) || isTrainer,
  );

  return (
    <aside
      className={cn(
        "hidden lg:bg-white lg:dark:bg-neutral-950 transition-all z-30",
        layout === "mini"
          ? "lg:flex lg:flex-row lg:items-center lg:fixed lg:top-0 lg:left-0 lg:w-full lg:h-16 lg:px-6 lg:border-b lg:border-neutral-100 lg:dark:border-neutral-800"
          : "lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-neutral-100 lg:dark:border-neutral-800",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3",
          layout === "mini"
            ? "h-full border-none"
            : "h-16 px-6 border-b border-neutral-100 dark:border-neutral-800",
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
          <span className="text-lg font-bold">O</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
            Punto de Inflexión
          </h1>
          <p className="text-[11px] text-neutral-400">Nutrition & Training</p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          layout === "mini"
            ? "flex-1 flex items-center justify-center gap-2 px-8"
            : "flex-1 px-3 py-4 space-y-1",
        )}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white",
                layout === "mini" && "px-4 py-2",
              )}
            >
              <div className={cn(layout === "mini" && "w-5 h-5")}>
                {item.icon}
              </div>
              {layout !== "mini" && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className={cn(
          "flex items-center gap-4",
          layout === "mini"
            ? "pr-6"
            : "border-t border-neutral-100 p-4 dark:border-neutral-800 flex-col",
        )}
      >
        {user && layout !== "mini" && (
          <div className="mb-3 px-3 w-full">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          className={cn(
            "flex items-center justify-center gap-3 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-red-500 dark:hover:bg-neutral-800 dark:hover:text-red-400 transition-colors",
            layout === "mini"
              ? "p-2 hover:bg-neutral-100"
              : "w-full px-3 py-2.5",
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {layout !== "mini" && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
