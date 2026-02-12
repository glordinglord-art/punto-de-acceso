'use client';

import { Sidebar } from '@/shared/components/layout/Sidebar';
import { MobileNav } from '@/shared/components/layout/MobileNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
