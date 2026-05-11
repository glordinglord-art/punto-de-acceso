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
import { UserCircle, KeyRound, LogOut, ArrowLeft, Save, Scale, Ruler, Dumbbell, ShieldAlert, Apple, Sparkles, Activity } from "lucide-react";

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
              className="h-32 animate-pulse rounded-2xl bg-white/5 border border-white/5"
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
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/5">
              <Avatar name={displayUser.name} size="xl" className="ring-2 ring-primary-500/20" />
              <div>
                <h2 className="text-2xl font-condensed font-bold uppercase tracking-wide text-white leading-tight">
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
                <label className="block text-sm font-medium text-slate-200">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-neutral-400">
                  🔒 {displayUser.email}
                  <span className="ml-auto text-xs opacity-50 uppercase tracking-widest font-condensed font-bold">(No editable)</span>
                </div>
              </div>

              <>
                <div className="mt-8 mb-4 flex items-center gap-3">
                  <Activity className="text-primary-500 w-5 h-5" />
                  <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-white m-0">
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
                    <label className="block text-sm font-medium text-slate-200 mb-3 flex items-center gap-2">
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
                              ? "bg-primary-500/10 border-primary-500 text-white shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)]"
                              : "bg-[#1a1a1a] border-white/5 text-neutral-400 hover:border-white/20 hover:bg-[#222]"
                          }`}
                        >
                          <span className="text-2xl drop-shadow-md">
                            {val.icon}
                          </span>
                          <div>
                            <p className={`font-condensed font-bold uppercase tracking-wide ${editDietaryGoal === key ? "text-primary-400" : "text-neutral-200"}`}>
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
                      <label className="block text-sm font-medium text-slate-200">
                        Nivel de Experiencia
                      </label>
                      <div className="relative">
                        <select
                          className="w-full rounded-2xl border border-white/12 bg-[#1a1a1a] px-4 py-3 text-sm text-white appearance-none transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                          value={editExperience}
                          onChange={(e) => setEditExperience(e.target.value)}
                        >
                          <option value="">No especificado</option>
                          <option value="Principiante">Principiante (0-1 año)</option>
                          <option value="Intermedio">Intermedio (1-3 años)</option>
                          <option value="Avanzado">Avanzado (+3 años)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-200">
                        Equipamiento Disponible
                      </label>
                      <div className="relative">
                        <select
                          className="w-full rounded-2xl border border-white/12 bg-[#1a1a1a] px-4 py-3 text-sm text-white appearance-none transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                          value={editEquipment}
                          onChange={(e) => setEditEquipment(e.target.value)}
                        >
                          <option value="">No especificado</option>
                          <option value="Ninguno">Ninguno</option>
                          <option value="Gimnasio completo">Gimnasio completo</option>
                          <option value="Solo mancuernas/cintas">Solo mancuernas / cintas</option>
                          <option value="Peso corporal (casa)">Peso corporal (casa)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
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

            <div className="mt-8 flex gap-3 pt-6 border-t border-white/5">
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
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(var(--color-amber-500),0.1)]">
                <KeyRound className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-condensed font-bold uppercase tracking-wide text-white leading-tight">
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
                <p className="text-sm text-neutral-400">
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

                <div className="mt-8 flex gap-3 pt-6 border-t border-white/5">
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
                <h2 className="text-3xl font-condensed font-bold uppercase tracking-wide text-white">
                  {displayUser.name}
                </h2>
                <p className="text-neutral-400 mb-3">
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
                <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-white m-0">
                  Perfil Fitness y Salud
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {displayUser.weight != null && (
                  <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 text-center">
                    <Scale className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest font-condensed mb-1">Peso</p>
                    <p className="text-xl font-bold text-white font-condensed">
                      {displayUser.weight} <span className="text-sm text-neutral-500">kg</span>
                    </p>
                  </div>
                )}
                {displayUser.height != null && (
                  <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 text-center">
                    <Ruler className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest font-condensed mb-1">Estatura</p>
                    <p className="text-xl font-bold text-white font-condensed">
                      {displayUser.height} <span className="text-sm text-neutral-500">cm</span>
                    </p>
                  </div>
                )}
                {displayUser.experienceLevel && (
                  <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 text-center">
                    <Dumbbell className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest font-condensed mb-1">Nivel</p>
                    <p className="text-sm font-bold text-white leading-tight">
                      {displayUser.experienceLevel}
                    </p>
                  </div>
                )}
                {displayUser.dietaryGoal && (
                  <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 text-center">
                    <div className="text-xl mx-auto mb-2">
                      {FITNESS_GOALS[displayUser.dietaryGoal as FitnessGoal]?.icon || "🎯"}
                    </div>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest font-condensed mb-1">Objetivo</p>
                    <p className="text-sm font-bold text-white leading-tight">
                      {FITNESS_GOALS[displayUser.dietaryGoal as FitnessGoal]?.label || displayUser.dietaryGoal}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {displayUser.equipmentAccess && (
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                    <span className="text-sm text-neutral-400">Equipamiento</span>
                    <span className="font-medium text-white">{displayUser.equipmentAccess}</span>
                  </div>
                )}
                {displayUser.medicalConditions && displayUser.medicalConditions.trim() !== "" && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                    <p className="text-[11px] font-bold tracking-widest uppercase font-condensed text-amber-500 flex items-center gap-1.5 mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Lesiones o Condiciones
                    </p>
                    <p className="text-sm text-amber-200">
                      {displayUser.medicalConditions}
                    </p>
                  </div>
                )}
                {displayUser.dietaryPreferences && displayUser.dietaryPreferences.trim() !== "" && (
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                    <p className="text-[11px] font-bold tracking-widest uppercase font-condensed text-blue-400 flex items-center gap-1.5 mb-1.5">
                      <Apple className="w-3.5 h-3.5" /> Preferencias o Alergias
                    </p>
                    <p className="text-sm text-blue-200">
                      {displayUser.dietaryPreferences}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Details Info */}
          <Card>
            <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-white mb-4">
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
                  className="flex justify-between items-center rounded-xl bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-neutral-400">{item.label}</span>
                  <span
                    className={`text-sm font-medium ${item.value === "Sin registrar" ? "text-neutral-500 italic" : "text-white"}`}
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
            <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-white mb-6">
              Acciones
            </h3>
            <div className="space-y-3">
              <Button variant="secondary" fullWidth onClick={openEdit} className="justify-start font-condensed tracking-wider uppercase font-bold text-sm h-12">
                <UserCircle className="w-4 h-4 mr-3" /> Editar perfil
              </Button>
              <Button variant="secondary" fullWidth onClick={openPasswordChange} className="justify-start font-condensed tracking-wider uppercase font-bold text-sm h-12">
                <KeyRound className="w-4 h-4 mr-3" /> Cambiar contraseña
              </Button>
              <div className="pt-4 mt-4 border-t border-white/5">
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
