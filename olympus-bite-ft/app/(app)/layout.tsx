'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { MobileNav } from '@/shared/components/layout/MobileNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 overflow-x-hidden">
      <Sidebar />
      <main className="lg:pl-64 min-w-0">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-8 min-w-0 w-full">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
