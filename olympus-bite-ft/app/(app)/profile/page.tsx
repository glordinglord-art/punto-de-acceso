"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usersService } from "@/features/auth/services/users.service";
import { Header } from "@/shared/components/layout/Header";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import type { User } from "@/shared/types/common.types";
import { FITNESS_GOALS } from "@/features/meals/types/meals.types";
import type { FitnessGoal } from "@/features/meals/types/meals.types";
import { UserCircle, KeyRound, LogOut, ArrowLeft, Save, Scale, Ruler, Dumbbell, ShieldAlert, Apple, Sparkles, Activity, Bell, BellRing, Clock, Send } from "lucide-react";
import { notificationsService } from "@/features/notifications/services/notifications.service";
import { isPushSupported, registerPushSubscription } from "@/features/notifications/lib/push";
import type { NotificationConfig, NotificationPreferences } from "@/features/notifications/types/notifications.types";

type ViewMode = "view" | "edit" | "password";

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("view");

  /* ─── Edit state ────────────────────────── */
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editDietaryGoal, setEditDietaryGoal] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editEquipment, setEditEquipment] = useState("");
  const [editMedical, setEditMedical] = useState("");
  const [editDietary, setEditDietary] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  /* ─── Password state ────────────────────── */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  /* ─── Notification state ────────────────── */
  const [isSupported, setIsSupported] = useState(false);
  const [notifConfig, setNotifConfig] = useState<NotificationConfig | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!authUser) return;
    try {
      const res = await usersService.getById(authUser.id);
      setProfile(res.data);
    } catch {
      /* fallback to auth user */
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (isPushSupported()) {
      setIsSupported(true);
      setPushPermission(Notification.permission);
      if (authUser) {
        notificationsService.getConfig().then((res) => setNotifConfig(res.data ?? null)).catch(() => undefined);
        notificationsService.getPreferences(authUser.id).then((res) => setNotifPrefs(res.data ?? null)).catch(() => undefined);
      }
    }
  }, [authUser]);

  /* ─── Notification Handlers ─────────────── */
  const enableNotifications = async () => {
    if (!authUser) return;
    setNotifLoading(true);
    setNotifMessage(null);
    try {
      const currentConfig = (await notificationsService.getConfig()).data;
      setNotifConfig(currentConfig ?? null);
      if (!currentConfig?.configured || !currentConfig.publicKey) {
        setNotifMessage("Faltan claves VAPID en el backend para activar push real.");
        return;
      }

      const nextPermission = await Notification.requestPermission();
      setPushPermission(nextPermission);
      if (nextPermission !== "granted") {
        setNotifMessage("Permiso no concedido. Puedes activarlo luego desde el navegador.");
        return;
      }

      const subscription = await registerPushSubscription(currentConfig.publicKey);
      await notificationsService.subscribe(authUser.id, subscription);
      const nextPrefs = await notificationsService.updatePreferences(authUser.id, {
        enabled: true,
        timezoneOffset: new Date().getTimezoneOffset(),
      });
      setNotifPrefs(nextPrefs.data ?? null);
      setNotifMessage("Notificaciones activadas en este dispositivo.");
    } catch (error) {
      setNotifMessage(error instanceof Error ? error.message : "No se pudo activar notificaciones.");
    } finally {
      setNotifLoading(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!authUser || !notifPrefs) return;
    const optimistic = { ...notifPrefs, enabled };
    setNotifPrefs(optimistic);
    try {
      const res = await notificationsService.updatePreferences(authUser.id, { enabled });
      setNotifPrefs(res.data ?? optimistic);
    } catch {
      setNotifPrefs(notifPrefs);
    }
  };

  const updateTime = async (
    field: keyof Pick<NotificationPreferences, "breakfastTime" | "lunchTime" | "dinnerTime" | "workoutTime">,
    value: string
  ) => {
    if (!authUser || !notifPrefs) return;
    const optimistic = { ...notifPrefs, [field]: value };
    setNotifPrefs(optimistic);
    try {
      const payload = {
        enabled: optimistic.enabled,
        breakfastTime: optimistic.breakfastTime,
        lunchTime: optimistic.lunchTime,
        dinnerTime: optimistic.dinnerTime,
        workoutTime: optimistic.workoutTime,
        timezoneOffset: optimistic.timezoneOffset,
      };
      const res = await notificationsService.updatePreferences(authUser.id, payload);
      setNotifPrefs(res.data ?? optimistic);
    } catch {
      // ignore
    }
  };

  const sendTestNotification = async () => {
    if (!authUser) return;
    setNotifLoading(true);
    setNotifMessage(null);
    try {
      const currentConfig = (await notificationsService.getConfig()).data;
      setNotifConfig(currentConfig ?? null);
      const res = await notificationsService.sendTest(authUser.id);
      setNotifMessage(
        res.data?.skipped
          ? "Backend sin claves VAPID configuradas."
          : "Notificación de prueba enviada."
      );
    } catch (error) {
      setNotifMessage(
        error instanceof Error ? error.message : "No se pudo enviar prueba."
      );
    } finally {
      setNotifLoading(false);
    }
  };

  /* ─── Handlers ──────────────────────────── */

  const openEdit = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditPhone(profile.phone ?? "");
    setEditWeight(profile.weight?.toString() ?? "");
    setEditHeight(profile.height?.toString() ?? "");
    setEditDietaryGoal(profile.dietaryGoal ?? "");
    setEditExperience(profile.experienceLevel ?? "");
    setEditEquipment(profile.equipmentAccess ?? "");
    setEditMedical(profile.medicalConditions ?? "");
    setEditDietary(profile.dietaryPreferences ?? "");
    setEditError("");
    setView("edit");
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    if (!editName.trim()) {
      setEditError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    setEditError("");
    try {
      const res = await usersService.updateProfile(profile.id, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        weight:
          editWeight === "" ? ("" as unknown as number) : Number(editWeight),
        height:
          editHeight === "" ? ("" as unknown as number) : Number(editHeight),
        dietaryGoal: editDietaryGoal,
        experienceLevel: editExperience,
        equipmentAccess: editEquipment,
        medicalConditions: editMedical.trim(),
        dietaryPreferences: editDietary.trim(),
      });
      setProfile(res.data);
      // Also update localStorage so sidebar reflects changes
      const savedUser = localStorage.getItem("ob_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.name = res.data.name;
          localStorage.setItem("ob_user", JSON.stringify(parsed));
        } catch {
          /* ignore */
        }
      }
      setView("view");
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Error actualizando perfil",
      );
    } finally {
      setSaving(false);
    }
  };

  const openPasswordChange = () => {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setPwError("");
    setPwSuccess(false);
    setView("password");
  };

  const handleChangePassword = async () => {
    if (!profile) return;
    if (!currentPw || !newPw) {
      setPwError("Todos los campos son obligatorios");
      return;
    }
    if (newPw.length < 6) {
      setPwError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Las contraseñas no coinciden");
      return;
    }
    setPwSaving(true);
    setPwError("");
    try {
      await usersService.changePassword(profile.id, {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setPwSuccess(true);
      setTimeout(() => setView("view"), 1500);
    } catch (err) {
      setPwError(
        err instanceof Error ? err.message : "Error cambiando contraseña",
      );
    } finally {
      setPwSaving(false);
    }
  };

  /* ─── Helpers ───────────────────────────── */

  const roleLabel = (role: string) => {
    switch (role) {
      case "trainer":
      case "admin":
        return "Entrenador";
      default:
        return "Cliente";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const displayUser =
    profile ??
    (authUser
      ? ({
          ...authUser,
          phone: null,
          isActive: true,
          createdAt: "",
          avatarUrl: null,
        } as User)
      : null);

  /* ─── Loading ───────────────────────────── */
  if (loading || !displayUser) {
    return (
      <>
        <Header title="Mi Perfil" />
        <div className="max-w-3xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-white/5"
            />
          ))}
        </div>
      </>
    );
  }

  /* ─── Edit Profile View ─────────────────── */
  if (view === "edit") {
    return (
      <>
        <Header title="Editar Perfil" />
        <div className="max-w-3xl mx-auto space-y-6">
          <Card padding="lg">
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-200 dark:border-white/5">
              <Avatar name={displayUser.name} size="xl" className="ring-2 ring-primary-500/20" />
              <div>
                <h2 className="text-2xl font-condensed font-bold uppercase tracking-wide text-slate-900 leading-tight dark:text-white">
                  Editar información
                </h2>
                <p className="text-sm text-primary-400 font-bold uppercase tracking-wider font-condensed">
                  Modifica tus datos personales
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Input
                label="Nombre"
                placeholder="Tu nombre completo"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <Input
                label="Teléfono"
                placeholder="+57 300 123 4567"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/5 dark:bg-white/5 dark:text-neutral-400">
                  🔒 {displayUser.email}
                  <span className="ml-auto text-xs opacity-50 uppercase tracking-widest font-condensed font-bold">(No editable)</span>
                </div>
              </div>

              <>
                <div className="mt-8 mb-4 flex items-center gap-3">
                  <Activity className="text-primary-500 w-5 h-5" />
                  <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-slate-900 m-0 dark:text-white">
                    Perfil Fitness y Salud
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Peso (kg)"
                      type="number"
                      placeholder="Ej: 75.5"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      step="0.1"
                    />
                    <Input
                      label="Estatura (cm)"
                      type="number"
                      placeholder="Ej: 175"
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2 dark:text-slate-200">
                      🎯 Objetivo Nutricional
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(
                        Object.entries(FITNESS_GOALS) as [
                          FitnessGoal,
                          (typeof FITNESS_GOALS)[FitnessGoal],
                        ][]
                      ).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setEditDietaryGoal(key)}
                          className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-left transition-all border ${
                            editDietaryGoal === key
                              ? "bg-primary-500/10 border-primary-500 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:text-white dark:shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)]"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#1a1a1a] dark:border-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-[#222]"
                          }`}
                        >
                          <span className="text-2xl drop-shadow-md">
                            {val.icon}
                          </span>
                          <div>
                            <p className={`font-condensed font-bold uppercase tracking-wide ${editDietaryGoal === key ? "text-primary-500 dark:text-primary-400" : "text-slate-900 dark:text-neutral-200"}`}>
                              {val.label}
                            </p>
                            <p className="text-[11px] leading-tight mt-0.5 opacity-70">
                              {val.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Nivel de Experiencia
                      </label>
                      <div className="relative">
                        <select
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 appearance-none transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-white/12 dark:bg-[#1a1a1a] dark:text-white"
                          value={editExperience}
                          onChange={(e) => setEditExperience(e.target.value)}
                        >
                          <option value="">No especificado</option>
                          <option value="Principiante">Principiante (0-1 año)</option>
                          <option value="Intermedio">Intermedio (1-3 años)</option>
                          <option value="Avanzado">Avanzado (+3 años)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-white/50">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Equipamiento Disponible
                      </label>
                      <div className="relative">
                        <select
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 appearance-none transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-white/12 dark:bg-[#1a1a1a] dark:text-white"
                          value={editEquipment}
                          onChange={(e) => setEditEquipment(e.target.value)}
                        >
                          <option value="">No especificado</option>
                          <option value="Ninguno">Ninguno</option>
                          <option value="Gimnasio completo">Gimnasio completo</option>
                          <option value="Solo mancuernas/cintas">Solo mancuernas / cintas</option>
                          <option value="Peso corporal (casa)">Peso corporal (casa)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-white/50">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Input
                    label="Lesiones o Condiciones Médicas"
                    placeholder="Ej: Dolor lumbar, hernia discal"
                    value={editMedical}
                    onChange={(e) => setEditMedical(e.target.value)}
                    icon={<ShieldAlert className="w-4 h-4" />}
                  />

                  <Input
                    label="Preferencias Alimentarias / Alergias"
                    placeholder="Ej: Intolerante a la lactosa, vegetariano"
                    value={editDietary}
                    onChange={(e) => setEditDietary(e.target.value)}
                    icon={<Apple className="w-4 h-4" />}
                  />
                </div>
              </>

              {editError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm">
                  {editError}
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3 pt-6 border-t border-slate-200 dark:border-white/5">
              <Button
                variant="ghost"
                onClick={() => setView("view")}
                disabled={saving}
                className="font-condensed font-bold uppercase tracking-wider flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button 
                loading={saving} 
                onClick={handleSaveProfile}
                className="font-condensed font-bold uppercase tracking-wider flex-1"
              >
                <Save className="w-4 h-4 mr-2" /> Guardar cambios
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  /* ─── Change Password View ──────────────── */
  if (view === "password") {
    return (
      <>
        <Header title="Cambiar Contraseña" />
        <div className="max-w-2xl mx-auto space-y-6">
          <Card padding="lg">
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-200 dark:border-white/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(var(--color-amber-500),0.1)]">
                <KeyRound className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-condensed font-bold uppercase tracking-wide text-slate-900 leading-tight dark:text-white">
                  Seguridad
                </h2>
                <p className="text-sm text-amber-400 font-bold uppercase tracking-wider font-condensed">
                  Actualizar tu contraseña
                </p>
              </div>
            </div>

            {pwSuccess ? (
              <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-green-400 mb-2">¡Contraseña Actualizada!</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-400">
                  Tu contraseña ha sido cambiada de forma segura.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <Input
                  label="Contraseña actual"
                  type="password"
                  placeholder="••••••••"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
                <Input
                  label="Nueva contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
                <Input
                  label="Confirmar nueva contraseña"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />

                {pwError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm">
                    {pwError}
                  </div>
                )}

                <div className="mt-8 flex gap-3 pt-6 border-t border-slate-200 dark:border-white/5">
                  <Button
                    variant="ghost"
                    onClick={() => setView("view")}
                    disabled={pwSaving}
                    className="font-condensed font-bold uppercase tracking-wider flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                  <Button 
                    loading={pwSaving} 
                    onClick={handleChangePassword}
                    className="font-condensed font-bold uppercase tracking-wider flex-1"
                  >
                    <KeyRound className="w-4 h-4 mr-2" /> Actualizar Contraseña
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </>
    );
  }

  /* ─── Main View ─────────────────────────── */
  return (
    <>
      <Header title="Mi Perfil" />

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        
        <div className="space-y-6">
          {/* Profile Card */}
          <Card padding="lg" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar name={displayUser.name} size="xl" className="h-24 w-24 ring-4 ring-white/5 shadow-xl" />
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                  {displayUser.name}
                </h2>
                <p className="text-slate-600 mb-3 dark:text-neutral-400">
                  {displayUser.email}
                </p>
                <Badge variant={displayUser.role === 'trainer' ? 'success' : 'default'} className="px-3 py-1 font-condensed tracking-widest text-xs uppercase">
                  {roleLabel(displayUser.role)}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Fitness Profile Section */}
          {(displayUser.weight != null || displayUser.height != null || displayUser.dietaryGoal || displayUser.experienceLevel) && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-primary-500 w-5 h-5" />
                <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-slate-900 m-0 dark:text-white">
                  Perfil Fitness y Salud
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {displayUser.weight != null && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/5 dark:bg-[#1a1a1a] dark:shadow-none">
                    <Scale className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest font-condensed mb-1">Peso</p>
                    <p className="text-xl font-bold text-slate-900 font-condensed dark:text-white">
                      {displayUser.weight} <span className="text-sm text-neutral-500">kg</span>
                    </p>
                  </div>
                )}
                {displayUser.height != null && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/5 dark:bg-[#1a1a1a] dark:shadow-none">
                    <Ruler className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest font-condensed mb-1">Estatura</p>
                    <p className="text-xl font-bold text-slate-900 font-condensed dark:text-white">
                      {displayUser.height} <span className="text-sm text-neutral-500">cm</span>
                    </p>
                  </div>
                )}
                {displayUser.experienceLevel && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/5 dark:bg-[#1a1a1a] dark:shadow-none">
                    <Dumbbell className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest font-condensed mb-1">Nivel</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight dark:text-white">
                      {displayUser.experienceLevel}
                    </p>
                  </div>
                )}
                {displayUser.dietaryGoal && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/5 dark:bg-[#1a1a1a] dark:shadow-none">
                    <div className="text-xl mx-auto mb-2">
                      {FITNESS_GOALS[displayUser.dietaryGoal as FitnessGoal]?.icon || "🎯"}
                    </div>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest font-condensed mb-1">Objetivo</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight dark:text-white">
                      {FITNESS_GOALS[displayUser.dietaryGoal as FitnessGoal]?.label || displayUser.dietaryGoal}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {displayUser.equipmentAccess && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                    <span className="text-sm text-slate-600 dark:text-neutral-400">Equipamiento</span>
                    <span className="font-medium text-slate-900 dark:text-white">{displayUser.equipmentAccess}</span>
                  </div>
                )}
                {displayUser.medicalConditions && displayUser.medicalConditions.trim() !== "" && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                    <p className="text-[11px] font-bold tracking-widest uppercase font-condensed text-amber-500 flex items-center gap-1.5 mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Lesiones o Condiciones
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {displayUser.medicalConditions}
                    </p>
                  </div>
                )}
                {displayUser.dietaryPreferences && displayUser.dietaryPreferences.trim() !== "" && (
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                    <p className="text-[11px] font-bold tracking-widest uppercase font-condensed text-blue-400 flex items-center gap-1.5 mb-1.5">
                      <Apple className="w-3.5 h-3.5" /> Preferencias o Alergias
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {displayUser.dietaryPreferences}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Recordatorios y Notificaciones */}
          {isSupported && (
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Bell className="text-primary-500 w-5.5 h-5.5" />
                  <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-slate-900 m-0 dark:text-white">
                    Notificaciones y Recordatorios
                  </h3>
                </div>
                {notifPrefs?.enabled && pushPermission === "granted" && (
                  <Badge variant="success" className="px-2.5 py-0.5 font-condensed tracking-wider text-[10px] uppercase">
                    Activas
                  </Badge>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-neutral-400 mb-6">
                Configura los horarios en los que deseas recibir recordatorios automáticos para tus comidas y entrenamientos diarios.
              </p>

              {pushPermission !== "granted" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-500 dark:text-amber-400/90">
                    <div className="flex gap-2.5">
                      <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
                      <div>
                        <p className="font-bold">Notificaciones desactivadas</p>
                        <p className="text-xs mt-0.5 opacity-90">
                          Debes conceder permisos de notificación en tu navegador para poder recibir alertas e ingresar tus horarios.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {notifConfig && !notifConfig.configured && (
                    <div className="flex gap-2 rounded-2xl border border-amber-400/30 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      Configura VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en backend para enviar push real.
                    </div>
                  )}

                  <Button 
                    fullWidth 
                    loading={notifLoading} 
                    onClick={enableNotifications}
                    className="font-condensed font-bold uppercase tracking-wider h-11"
                  >
                    <BellRing className="w-4 h-4 mr-2" /> Permitir Notificaciones
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Interruptor General */}
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/5 dark:bg-white/5">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Habilitar Recordatorios</p>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">Recibir avisos diarios push en este navegador</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notifPrefs?.enabled ?? false}
                        onChange={(e) => handleToggleNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:bg-slate-300 peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  {notifPrefs?.enabled ? (
                    <div className="space-y-3.5">
                      {(
                        [
                          { field: "breakfastTime", label: "Desayuno" },
                          { field: "lunchTime", label: "Almuerzo" },
                          { field: "dinnerTime", label: "Cena" },
                          { field: "workoutTime", label: "Entrenamiento / Rutina" },
                        ] as const
                      ).map(({ field, label }) => (
                        <div key={field} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/5 dark:bg-[#1a1a1a]">
                          <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-neutral-300">
                            <Clock className="h-4 w-4 text-primary-400" /> {label}
                          </span>
                          <input
                            type="time"
                            value={notifPrefs?.[field] || "08:00"}
                            onChange={(e) => updateTime(field, e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary-400 focus:bg-white dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-primary-500 dark:focus:bg-slate-900"
                          />
                        </div>
                      ))}

                      <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                        <Button 
                          variant="secondary" 
                          fullWidth 
                          loading={notifLoading} 
                          onClick={sendTestNotification}
                          className="font-condensed font-bold uppercase tracking-wider text-sm h-11"
                        >
                          <Send className="h-4 w-4 mr-2" /> Enviar Notificación de Prueba
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-white/5 dark:bg-white/5">
                      <p className="text-sm text-slate-500 dark:text-neutral-400">
                        Habilita los recordatorios para configurar las horas.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {notifMessage && (
                <div className="mt-4 rounded-xl bg-slate-100 p-3 text-xs text-slate-600 dark:bg-white/5 dark:text-neutral-300">
                  {notifMessage}
                </div>
              )}
            </Card>
          )}

          {/* Details Info */}
          <Card>
            <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-slate-900 mb-4 dark:text-white">
              Información de Contacto
            </h3>
            <div className="space-y-2">
              {[
                { label: "Teléfono", value: displayUser.phone ?? "Sin registrar" },
                {
                  label: "Miembro desde",
                  value: displayUser.createdAt
                    ? formatDate(displayUser.createdAt)
                    : "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5"
                >
                  <span className="text-sm text-slate-600 dark:text-neutral-400">{item.label}</span>
                  <span
                    className={`text-sm font-medium ${item.value === "Sin registrar" ? "text-slate-500 italic" : "text-slate-900 dark:text-white"}`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-slate-900 mb-6 dark:text-white">
              Acciones
            </h3>
            <div className="space-y-3">
              <Button variant="secondary" fullWidth onClick={openEdit} className="justify-start font-condensed tracking-wider uppercase font-bold text-sm h-12">
                <UserCircle className="w-4 h-4 mr-3" /> Editar perfil
              </Button>
              <Button variant="secondary" fullWidth onClick={openPasswordChange} className="justify-start font-condensed tracking-wider uppercase font-bold text-sm h-12">
                <KeyRound className="w-4 h-4 mr-3" /> Cambiar contraseña
              </Button>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/5">
                <Button variant="danger" fullWidth onClick={logout} className="justify-start font-condensed tracking-wider uppercase font-bold text-sm h-12 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border-none">
                  <LogOut className="w-4 h-4 mr-3" /> Cerrar sesión
                </Button>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </>
  );
}
