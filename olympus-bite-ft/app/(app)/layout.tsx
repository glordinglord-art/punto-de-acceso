"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSettings } from "@/shared/contexts/SettingsContext";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { MobileNav } from "@/shared/components/layout/MobileNav";
import { OnboardingSurveyModal } from "@/features/clients/components/OnboardingSurveyModal";
import { SettingsTrigger } from "@/shared/components/ui/SettingsTrigger";
import { GlobalAiAssistant } from "@/shared/components/ui/GlobalAiAssistant";
import { NotificationPrompt } from "@/features/notifications/components/NotificationPrompt";
import { cn } from "@/shared/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { layout } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

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

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100/35 text-slate-950 dark:bg-neutral-950 dark:text-white">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300 min-w-0 flex flex-col",
          layout === "mini" ? "lg:pt-16 lg:pl-0" : "lg:pl-64",
        )}
      >
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-8 min-w-0 w-full flex-1">
          {children}
        </div>
      </main>
      <MobileNav />
      {/* Modal para clientes nuevos */}
      <OnboardingSurveyModal />
      <SettingsTrigger />
      <GlobalAiAssistant />
      <NotificationPrompt />
    </div>
  );
}
