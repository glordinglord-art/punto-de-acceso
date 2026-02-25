"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { SettingsProvider } from "@/shared/contexts/SettingsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsProvider>
        <AuthProvider>{children}</AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
