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
        <div className="max-w-2xl space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800"
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
        <div className="max-w-2xl space-y-6">
          <Card padding="lg">
            <div className="flex items-center gap-5 mb-6">
              <Avatar name={displayUser.name} size="xl" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Editar información
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Modifica los campos que necesites
                </p>
              </div>
            </div>

            <div className="space-y-4">
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
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-2.5 text-sm text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  🔒 {displayUser.email}
                  <span className="ml-auto text-xs">(no editable)</span>
                </div>
              </div>

              {displayUser.role === "client" &&
                displayUser.onboardingCompleted && (
                  <>
                    <hr className="border-neutral-100 dark:border-neutral-800 my-4" />
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                      Perfil Fitness y Salud
                    </h3>

                    <div className="space-y-4">
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
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 mt-4 flex items-center gap-2">
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
                              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                                editDietaryGoal === key
                                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-2 border-neutral-900 dark:border-white shadow-md transform scale-[1.02]"
                                  : "bg-white dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 border-2 border-neutral-100 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                              }`}
                            >
                              <span className="text-2xl drop-shadow-sm">
                                {val.icon}
                              </span>
                              <div>
                                <p className="font-bold text-sm leading-tight">
                                  {val.label}
                                </p>
                                <p
                                  className={`text-[11px] mt-0.5 leading-tight ${editDietaryGoal === key ? "text-neutral-300 dark:text-neutral-500" : "text-neutral-500 dark:text-neutral-500"}`}
                                >
                                  {val.description}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Nivel de Experiencia
                        </label>
                        <select
                          className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2"
                          value={editExperience}
                          onChange={(e) => setEditExperience(e.target.value)}
                        >
                          <option value="">No especificado</option>
                          <option value="Principiante">
                            Principiante (0-1 año)
                          </option>
                          <option value="Intermedio">
                            Intermedio (1-3 años)
                          </option>
                          <option value="Avanzado">Avanzado (+3 años)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Equipamiento Disponible
                        </label>
                        <select
                          className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2"
                          value={editEquipment}
                          onChange={(e) => setEditEquipment(e.target.value)}
                        >
                          <option value="">No especificado</option>
                          <option value="Ninguno">Ninguno</option>
                          <option value="Gimnasio completo">
                            Gimnasio completo
                          </option>
                          <option value="Solo mancuernas/cintas">
                            Solo mancuernas / cintas
                          </option>
                          <option value="Peso corporal (casa)">
                            Peso corporal (casa)
                          </option>
                        </select>
                      </div>

                      <Input
                        label="Lesiones o Condiciones Médicas"
                        placeholder="Ej: Dolor lumbar, hernia discal"
                        value={editMedical}
                        onChange={(e) => setEditMedical(e.target.value)}
                      />

                      <Input
                        label="Preferencias Alimentarias / Alergias"
                        placeholder="Ej: Intolerante a la lactosa, vegetariano"
                        value={editDietary}
                        onChange={(e) => setEditDietary(e.target.value)}
                      />
                    </div>
                  </>
                )}

              {editError && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {editError}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setView("view")}
                disabled={saving}
              >
                ← Cancelar
              </Button>
              <Button loading={saving} onClick={handleSaveProfile}>
                💾 Guardar cambios
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
        <div className="max-w-2xl space-y-6">
          <Card padding="lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <span className="text-xl">🔑</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Cambiar contraseña
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Ingresa tu contraseña actual y la nueva
                </p>
              </div>
            </div>

            {pwSuccess ? (
              <div className="rounded-xl bg-green-50 p-6 text-center dark:bg-green-900/20">
                <span className="text-3xl">✅</span>
                <p className="mt-2 font-medium text-green-700 dark:text-green-400">
                  Contraseña actualizada correctamente
                </p>
              </div>
            ) : (
              <div className="space-y-4">
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
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {pwError}
                  </p>
                )}

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setView("view")}
                    disabled={pwSaving}
                  >
                    ← Cancelar
                  </Button>
                  <Button loading={pwSaving} onClick={handleChangePassword}>
                    🔒 Cambiar contraseña
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

      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card padding="lg">
          <div className="flex items-center gap-5">
            <Avatar name={displayUser.name} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {displayUser.name}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {displayUser.email}
              </p>
              <Badge variant="info" className="mt-2">
                {roleLabel(displayUser.role)}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card>
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
            Información personal
          </h3>
          <div className="space-y-4">
            {[
              { label: "Nombre", value: displayUser.name },
              { label: "Email", value: displayUser.email },
              {
                label: "Teléfono",
                value: displayUser.phone ?? "Sin registrar",
              },
              {
                label: "Miembro desde",
                value: displayUser.createdAt
                  ? formatDate(displayUser.createdAt)
                  : "—",
              },
            ].map((item, idx, arr) => (
              <div
                key={item.label}
                className={`flex justify-between items-center py-2 ${idx < arr.length - 1 ? "border-b border-neutral-50 dark:border-neutral-800" : ""}`}
              >
                <span className="text-sm text-neutral-500">{item.label}</span>
                <span
                  className={`text-sm font-medium ${item.value === "Sin registrar" ? "text-neutral-400 italic" : "text-neutral-900 dark:text-white"}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Advanced Client Profile Section */}
        {displayUser.role === "client" && displayUser.onboardingCompleted && (
          <Card>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Perfil Fitness y Salud
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayUser.weight != null && (
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
                  <p className="text-xs text-neutral-500 mb-1">Peso Actual</p>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {displayUser.weight} kg
                  </p>
                </div>
              )}
              {displayUser.height != null && (
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
                  <p className="text-xs text-neutral-500 mb-1">Estatura</p>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {displayUser.height} cm
                  </p>
                </div>
              )}
              {displayUser.dietaryGoal && (
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
                  <p className="text-xs text-neutral-500 mb-1">
                    Objetivo Nutricional
                  </p>
                  <p className="font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                    {
                      FITNESS_GOALS[displayUser.dietaryGoal as FitnessGoal]
                        ?.icon
                    }{" "}
                    {FITNESS_GOALS[displayUser.dietaryGoal as FitnessGoal]
                      ?.label || displayUser.dietaryGoal}
                  </p>
                </div>
              )}
              {displayUser.experienceLevel && (
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
                  <p className="text-xs text-neutral-500 mb-1">
                    Nivel de Experiencia
                  </p>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {displayUser.experienceLevel}
                  </p>
                </div>
              )}
              {displayUser.equipmentAccess && (
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
                  <p className="text-xs text-neutral-500 mb-1">Equipamiento</p>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {displayUser.equipmentAccess}
                  </p>
                </div>
              )}
              {displayUser.medicalConditions &&
                displayUser.medicalConditions.trim() !== "" && (
                  <div className="sm:col-span-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4">
                    <p className="text-xs text-amber-600 dark:text-amber-500 mb-1 font-semibold flex items-center gap-1">
                      <span>⚠️</span> Lesiones o Condiciones
                    </p>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {displayUser.medicalConditions}
                    </p>
                  </div>
                )}
              {displayUser.dietaryPreferences &&
                displayUser.dietaryPreferences.trim() !== "" && (
                  <div className="sm:col-span-2 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-4">
                    <p className="text-xs text-orange-600 dark:text-orange-500 mb-1 font-semibold flex items-center gap-1">
                      <span>🥗</span> Preferencias o Alergias
                    </p>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      {displayUser.dietaryPreferences}
                    </p>
                  </div>
                )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
            Configuración
          </h3>
          <div className="space-y-3">
            <Button variant="secondary" fullWidth onClick={openEdit}>
              ✏️ Editar perfil
            </Button>
            <Button variant="secondary" fullWidth onClick={openPasswordChange}>
              🔑 Cambiar contraseña
            </Button>
            <Button variant="danger" fullWidth onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
