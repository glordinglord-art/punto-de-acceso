'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, Clock, Send, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/utils';
import { notificationsService } from '../services/notifications.service';
import { isPushSupported, registerPushSubscription } from '../lib/push';
import type { NotificationConfig, NotificationPreferences } from '../types/notifications.types';

export function NotificationPrompt() {
  const { user } = useAuth();
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isPushSupported()) return;
    setPermission(Notification.permission);
    notificationsService.getConfig().then((res) => setConfig(res.data ?? null)).catch(() => undefined);
    notificationsService.getPreferences(user.id).then((res) => setPrefs(res.data ?? null)).catch(() => undefined);
  }, [user]);

  if (!user || !isPushSupported()) return null;
  if (permission === 'granted' && !isOpen) return null;

  const enableNotifications = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const currentConfig = config ?? (await notificationsService.getConfig()).data;
      setConfig(currentConfig ?? null);
      if (!currentConfig?.configured || !currentConfig.publicKey) {
        setMessage('Faltan claves VAPID en el backend para activar push real.');
        return;
      }

      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);
      if (nextPermission !== 'granted') {
        setMessage('Permiso no concedido. Puedes activarlo luego desde el navegador.');
        return;
      }

      const subscription = await registerPushSubscription(currentConfig.publicKey);
      await notificationsService.subscribe(user.id, subscription);
      const nextPrefs = await notificationsService.updatePreferences(user.id, {
        enabled: true,
        timezoneOffset: new Date().getTimezoneOffset(),
      });
      setPrefs(nextPrefs.data ?? null);
      setMessage('Notificaciones activadas en este dispositivo.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo activar notificaciones.');
    } finally {
      setLoading(false);
    }
  };

  const updateTime = async (field: keyof Pick<NotificationPreferences, 'breakfastTime' | 'lunchTime' | 'dinnerTime' | 'workoutTime'>, value: string) => {
    if (!prefs) return;
    const optimistic = { ...prefs, [field]: value };
    setPrefs(optimistic);
    const res = await notificationsService.updatePreferences(user.id, optimistic);
    setPrefs(res.data ?? optimistic);
  };

  const sendTest = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await notificationsService.sendTest(user.id);
      setMessage(res.data?.skipped ? 'Backend sin claves VAPID configuradas.' : 'Notificacion de prueba enviada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo enviar prueba.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm lg:bottom-5')}>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-[24px] border border-primary-400/25 bg-slate-950/95 p-4 text-left shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl transition hover:border-primary-300/50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-400/15 text-primary-300">
            <BellRing className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-white">Activar recordatorios</span>
            <span className="block text-xs text-slate-400">Comidas y rutina directo al celular.</span>
          </span>
        </button>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.5)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-400/15 text-primary-300">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-bold uppercase text-white">Notificaciones</p>
                <p className="text-xs text-slate-400">Desayuno, comida, cena y rutina.</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {config && !config.configured && (
            <div className="mt-4 flex gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              Configura VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en backend para enviar push real.
            </div>
          )}

          <Button className="mt-4" fullWidth loading={loading} onClick={enableNotifications}>
            {permission === 'granted' ? 'Sincronizar dispositivo' : 'Aceptar notificaciones'}
          </Button>

          {prefs && permission === 'granted' && (
            <div className="mt-4 space-y-3">
              {[
                ['breakfastTime', 'Desayuno'],
                ['lunchTime', 'Almuerzo'],
                ['dinnerTime', 'Cena'],
                ['workoutTime', 'Rutina'],
              ].map(([field, label]) => (
                <label key={field} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <Clock className="h-4 w-4 text-primary-300" /> {label}
                  </span>
                  <input
                    type="time"
                    value={prefs[field as keyof NotificationPreferences] as string}
                    onChange={(e) => updateTime(field as keyof Pick<NotificationPreferences, 'breakfastTime' | 'lunchTime' | 'dinnerTime' | 'workoutTime'>, e.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white outline-none focus:border-primary-400"
                  />
                </label>
              ))}
              <Button variant="secondary" fullWidth loading={loading} onClick={sendTest}>
                <Send className="h-4 w-4" /> Enviar prueba
              </Button>
            </div>
          )}

          {message && <p className="mt-3 text-xs text-slate-300">{message}</p>}
        </div>
      )}
    </div>
  );
}
