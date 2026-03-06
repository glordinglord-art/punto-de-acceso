'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '../../lib/utils';

const allNavItems = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/meals', label: 'Comidas', icon: '🍽️' },
  { href: '/routines', label: 'Rutinas', icon: '💪' },
  { href: '/tasks', label: 'Tareas', icon: '📋' },
  { href: '/clients', label: 'Clientes', icon: '👥', trainerOnly: true },
  { href: '/profile', label: 'Perfil', icon: '👤' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isTrainer } = useAuth();

  const navItems = allNavItems.filter((item) => !item.trainerOnly || isTrainer);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-neutral-100 lg:hidden dark:bg-neutral-950/80 dark:border-neutral-800">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all',
                isActive
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-400 dark:text-neutral-500',
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {isActive && (
                <div className="h-1 w-1 rounded-full bg-neutral-900 dark:bg-white" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
