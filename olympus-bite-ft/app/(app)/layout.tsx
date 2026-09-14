"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSettings } from "@/shared/contexts/SettingsContext";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { MobileNav } from "@/shared/components/layout/MobileNav";
import { SettingsTrigger } from "@/shared/components/ui/SettingsTrigger";
import { GlobalAiAssistant } from "@/shared/components/ui/GlobalAiAssistant";
import { NotificationPrompt } from "@/features/notifications/components/NotificationPrompt";
import { cn } from "@/shared/lib/utils";
import { BackgroundAnalysisProvider } from "@/features/meals/contexts/BackgroundAnalysisContext";
import { ConfirmProvider } from "@/shared/contexts/ConfirmContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, activeMode } = useAuth();
  const { layout } = useSettings();
  const router = useRouter();
  const pathname = usePathname();

  // Aplica para clientes directos y para entrenadores / superadmins cuando están en MODO ATLETA
  const isAthleteMode = user?.role === "client" || activeMode === "client";
  const needsOnboarding = Boolean(user && isAthleteMode && !user.onboardingCompleted);
  const isOnboardingRoute = pathname === "/onboarding";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isLoading && isAuthenticated) {
      if (needsOnboarding && !isOnboardingRoute) {
        router.replace("/onboarding");
      }
    }
  }, [isLoading, isAuthenticated, needsOnboarding, isOnboardingRoute, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-primary-500 dark:border-white/10 dark:border-t-primary-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // HARD GATEKEEPER: Bloqueo estricto para clientes sin onboarding
  if (needsOnboarding && !isOnboardingRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Redirigiendo a evaluación inicial...
          </p>
        </div>
      </div>
    );
  }

  // AISLAMIENTO VISUAL: /onboarding en pantalla completa sin barras ni distracciones
  if (isOnboardingRoute) {
    return (
      <div className="min-h-screen bg-[#07090c] text-white selection:bg-red-500 selection:text-white">
        {children}
      </div>
    );
  }

  return (
    <ConfirmProvider>
      <BackgroundAnalysisProvider>
        <div className="min-h-screen overflow-x-hidden bg-slate-50/60 text-slate-950 dark:bg-[#090b0e] dark:text-white">
          <Sidebar />
          <main
            className={cn(
              "transition-all duration-300 min-w-0 flex flex-col",
              layout === "mini" ? "lg:pt-20 lg:pl-0" : "lg:pl-72",
            )}
          >
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-28 lg:pb-12 min-w-0 w-full flex-1">
              {children}
            </div>
          </main>
          <MobileNav />
          <SettingsTrigger />
          <GlobalAiAssistant />
          <NotificationPrompt />
        </div>
      </BackgroundAnalysisProvider>
    </ConfirmProvider>
  );
}
