"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { clientsService } from "@/features/clients/services/clients.service";
import { toast } from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Dumbbell,
  Droplets,
  Moon,
  Flame,
  ShieldCheck,
  Sparkles,
  Clock,
  Activity,
  Check,
} from "lucide-react";

const STRENGTH_PRESETS = [
  "Press Banca con Mancuernas",
  "Press Banca con Barra",
  "Sentadilla Libre",
  "Peso Muerto",
  "Press Militar",
  "Dominadas Lastradas",
];

const MASTERY_PRESETS = [
  "Parada de Manos (Handstand)",
  "Muscle-Up en Barra",
  "15 Dominadas Estrictas",
  "Front Lever / Core Isométrico",
  "Pino por Fuerza (Press Handstand)",
  "Movilidad Total y Control Escapular",
];

const INJURY_OPTIONS = [
  "Ninguna molestia",
  "Hombros / Manguito rotador",
  "Muñecas / Codos",
  "Espalda baja / Lumbar",
  "Rodillas",
];

export default function AthleteDiscoveryPage() {
  const router = useRouter();
  const { user, updateUser, setActiveMode } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Unidad global kg | lbs
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(
    (user?.weightUnitPreference as "kg" | "lbs") || "kg",
  );

  // Bloque 1: Biometría y Presupuesto de Tiempo
  const [gender, setGender] = useState<"male" | "female">(
    (user?.gender as "male" | "female") || "male",
  );
  const [age, setAge] = useState<string>(user?.age?.toString() || "25");
  const [height, setHeight] = useState<string>(
    user?.height?.toString() || "172",
  );
  const [weight, setWeight] = useState<string>(
    user?.weight?.toString() || "72",
  );
  const [estimatedBodyFat, setEstimatedBodyFat] = useState<string>("16");
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number>(4);
  const [minutesPerSession, setMinutesPerSession] = useState<number>(60);
  const [activityLevel, setActivityLevel] = useState<
    "sedentary" | "moderate" | "active"
  >("moderate");

  // Bloque 2: Los 4 Objetivos del Mesociclo (120 Días)
  const [biometricMode, setBiometricMode] = useState<
    "surplus" | "deficit" | "recomp"
  >("surplus");
  const [targetWeight, setTargetWeight] = useState<string>("76");
  const [targetBodyFat, setTargetBodyFat] = useState<string>("13");

  const [strengthExercise, setStrengthExercise] = useState<string>(
    "Press Banca con Mancuernas",
  );
  const [strengthCurrentWeight, setStrengthCurrentWeight] =
    useState<string>("25");
  const [strengthTargetWeight, setStrengthTargetWeight] =
    useState<string>("40");

  const [masterySkill, setMasterySkill] = useState<string>(
    "Parada de Manos (Handstand)",
  );
  const [masteryCurrentLevel, setMasteryCurrentLevel] = useState<string>(
    "Pino en pared 20s",
  );
  const [masteryTargetLevel, setMasteryTargetLevel] = useState<string>(
    "15s libre controlado",
  );

  const [aerobicEnabled, setAerobicEnabled] = useState<boolean>(true);
  const [aerobicSkill, setAerobicSkill] = useState<string>("Carrera 5K");
  const [aerobicCurrentMark, setAerobicCurrentMark] =
    useState<string>("28 min");
  const [aerobicTargetMark, setAerobicTargetMark] = useState<string>(
    "Sub 23 min",
  );

  // Bloque 3: Diagnóstico de Entrenamiento y Alimentación
  const [experienceLevel, setExperienceLevel] = useState<string>("intermediate");
  const [equipmentAccess, setEquipmentAccess] = useState<string>("full_gym");
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([
    "Ninguna molestia",
  ]);
  const [injuryNotes, setInjuryNotes] = useState<string>("");
  const [mealsPerDay, setMealsPerDay] = useState<number>(4);
  const [nutritionWeakness, setNutritionWeakness] = useState<string>(
    "Falta de tiempo para medir porciones",
  );

  // Bloque 4: Recuperación Circadiana (±1h) y Compromiso
  const [targetBedtime, setTargetBedtime] = useState<string>("22:30");
  const [targetWakeTime, setTargetWakeTime] = useState<string>("06:00");
  const [pastObstacle, setPastObstacle] = useState<string>("");
  const [commitmentScore, setCommitmentScore] = useState<number>(10);

  const toggleUnit = (nextUnit: "kg" | "lbs") => {
    if (nextUnit === weightUnit) return;
    const factor = nextUnit === "lbs" ? 2.20462 : 1 / 2.20462;
    const conv = (val: string) => {
      const n = parseFloat(val);
      if (isNaN(n)) return val;
      return Math.round(n * factor * 2) / 2 + "";
    };
    setWeight(conv(weight));
    setTargetWeight(conv(targetWeight));
    setStrengthCurrentWeight(conv(strengthCurrentWeight));
    setStrengthTargetWeight(conv(strengthTargetWeight));
    setWeightUnit(nextUnit);
  };

  // Cálculo en vivo de horas de sueño pactadas
  const calcSleepHours = () => {
    const [bh, bm] = targetBedtime.split(":").map(Number);
    const [wh, wm] = targetWakeTime.split(":").map(Number);
    const bedMin = (bh || 0) * 60 + (bm || 0);
    const wakeMin = (wh || 0) * 60 + (wm || 0);
    const diff = wakeMin >= bedMin ? wakeMin - bedMin : 1440 - bedMin + wakeMin;
    return Number((diff / 60).toFixed(1));
  };

  const sleepHoursTarget = calcSleepHours();
  const rawWeightNum = parseFloat(weight) || 70;
  const weightKgPreview =
    weightUnit === "lbs"
      ? Number((rawWeightNum / 2.20462).toFixed(1))
      : rawWeightNum;
  const waterLitersPreview = Number(
    ((weightKgPreview * 35 + 500) / 1000).toFixed(1),
  );
  const weeklyDeltaLabel =
    biometricMode === "surplus"
      ? weightUnit === "lbs"
        ? "+0.55 lbs / semana (+0.25 kg)"
        : "+0.25 kg / semana"
      : biometricMode === "deficit"
        ? weightUnit === "lbs"
          ? "-1.1 lbs / semana (-0.50 kg)"
          : "-0.50 kg / semana"
        : "Mantenimiento recomposición";

  const toggleInjury = (item: string) => {
    if (item === "Ninguna molestia") {
      setSelectedInjuries(["Ninguna molestia"]);
      return;
    }
    const withoutNone = selectedInjuries.filter(
      (i) => i !== "Ninguna molestia",
    );
    if (withoutNone.includes(item)) {
      const next = withoutNone.filter((i) => i !== item);
      setSelectedInjuries(next.length ? next : ["Ninguna molestia"]);
    } else {
      setSelectedInjuries([...withoutNone, item]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const targetWeightNum = parseFloat(targetWeight) || rawWeightNum;
      const targetWeightKg =
        weightUnit === "lbs"
          ? Number((targetWeightNum / 2.20462).toFixed(1))
          : targetWeightNum;

      const injuriesCombined = [
        ...selectedInjuries,
        injuryNotes.trim() ? `Nota: ${injuryNotes.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await clientsService.submitDiscovery(user.id, {
        weightUnit,
        gender,
        age: Number(age) || 25,
        height: Number(height) || 170,
        weight: rawWeightNum,
        estimatedBodyFat: Number(estimatedBodyFat) || 16,
        trainingDaysPerWeek,
        minutesPerSession,
        activityLevel,
        biometricMode,
        targetWeightKg,
        targetBodyFat: Number(targetBodyFat) || 13,
        strengthExercise,
        strengthCurrentWeight: Number(strengthCurrentWeight) || 20,
        strengthTargetWeight: Number(strengthTargetWeight) || 40,
        masterySkill,
        masteryCurrentLevel,
        masteryTargetLevel,
        aerobicEnabled,
        aerobicSkill,
        aerobicCurrentMark,
        aerobicTargetMark,
        experienceLevel,
        equipmentAccess,
        injuries: injuriesCombined,
        mealsPerDay,
        nutritionWeakness,
        targetBedtime,
        targetWakeTime,
        sleepHoursTarget,
        pastObstacle,
        commitmentScore,
      });

      if (res?.data) {
        updateUser(res.data);
      }
      toast.success("¡Listo! Tus 4 metas de 120 días están activas.");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar tus metas",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isTrainerUser =
    user?.role === "trainer" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  return (
    <div className="min-h-[100dvh] bg-[#07090d] text-white flex flex-col justify-between max-w-md md:max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
      {/* Barra Superior Minimalista */}
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-300" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-500">
                TU PLAN DE 4 MESES • PASO {step} DE 5
              </p>
              <h1 className="text-lg sm:text-xl font-condensed font-bold uppercase tracking-wide text-white">
                {step === 1 && "1. Tu Punto de Partida"}
                {step === 2 && "2. Tus 4 Metas para estos 4 Meses"}
                {step === 3 && "3. Tu Entreno y Alimentación"}
                {step === 4 && "4. Tu Horario de Sueño"}
                {step === 5 && "5. Resumen de tu Plan"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Switch Global kg | lbs */}
            <div className="flex rounded-xl bg-white/5 p-0.5 border border-white/10">
              {(["kg", "lbs"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => toggleUnit(u)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition ${
                    weightUnit === u
                      ? "bg-red-600 text-white shadow"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>

            {isTrainerUser && Boolean(user?.anamnesisData?.discoveryCompletedAt) && (
              <button
                type="button"
                onClick={() => {
                  setActiveMode("trainer", true);
                  router.replace("/dashboard");
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 text-[10px] font-bold uppercase tracking-wider text-neutral-200 border border-white/15"
              >
                Coach
              </button>
            )}
          </div>
        </div>

        {/* Barra de progreso fina */}
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-red-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Contenido Central por Paso (100% Mobile-First, sin saturación) */}
      <main className="flex-1 py-4 space-y-4 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Cuéntanos cómo estás hoy y cuánto tiempo tienes a la semana para armar un plan realista a tu medida.
            </p>

            {/* Sexo Biológico */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "male", label: "Hombre" },
                { id: "female", label: "Mujer" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id as "male" | "female")}
                  className={`py-3.5 rounded-2xl border text-sm font-bold transition ${
                    gender === g.id
                      ? "bg-red-500/15 border-red-500 text-white shadow-sm"
                      : "bg-white/[0.03] border-white/10 text-neutral-400"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Edad, Estatura, Peso en Ayunas, % Grasa */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Edad (Años)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Estatura (cm)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-red-500/30">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                  Peso en Ayunas ({weightUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  % Grasa Estimado
                </label>
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  value={estimatedBodyFat}
                  onChange={(e) => setEstimatedBodyFat(e.target.value)}
                  className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Disponibilidad Semanal Real */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-400" />
                  Días de Entreno por Semana
                </span>
                <span className="text-xs font-bold text-red-400">
                  {trainingDaysPerWeek} días/sem
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTrainingDaysPerWeek(d)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      trainingDaysPerWeek === d
                        ? "bg-red-600 border-red-500 text-white"
                        : "bg-white/5 border-white/10 text-neutral-400"
                    }`}
                  >
                    {d} días
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Minutos disponibles por sesión:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[45, 60, 75, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinutesPerSession(m)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        minutesPerSession === m
                          ? "bg-white text-black border-white"
                          : "bg-white/5 border-white/10 text-neutral-400"
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actividad diaria fuera del gimnasio */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Tu día a día fuera del entreno:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "sedentary", label: "Oficina / Sentado" },
                  { id: "moderate", label: "Caminatas / Mixto" },
                  { id: "active", label: "Físico / Intenso" },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityLevel(act.id as any)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition ${
                      activityLevel === act.id
                        ? "bg-red-500/15 border-red-500 text-white"
                        : "bg-white/[0.03] border-white/10 text-neutral-400"
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <p className="text-xs sm:text-sm text-neutral-300">
              Elige las 4 metas que vamos a cumplir juntos en estos 4 meses (120 días):
            </p>

            {/* 1. Meta de Peso y Físico */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  1. Meta de Peso y Físico
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Ritmo: {weeklyDeltaLabel}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "surplus", label: "Subir Músculo" },
                  { id: "deficit", label: "Bajar Grasa" },
                  { id: "recomp", label: "Mantener y Definir" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setBiometricMode(m.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      biometricMode === m.id
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : "bg-white/5 border-white/10 text-neutral-400"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <span className="block text-[10px] text-neutral-400 uppercase">
                    Peso Meta ({weightUnit})
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <span className="block text-[10px] text-neutral-400 uppercase">
                    % Grasa Meta (Mensual)
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={targetBodyFat}
                    onChange={(e) => setTargetBodyFat(e.target.value)}
                    className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Objetivo de Fuerza */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4" />
                2. Objetivo de Fuerza (4 Meses)
              </span>

              <div className="flex flex-wrap gap-1.5">
                {STRENGTH_PRESETS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setStrengthExercise(ex)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                      strengthExercise === ex
                        ? "bg-amber-500 text-black font-bold border-amber-400"
                        : "bg-white/5 border-white/10 text-neutral-300"
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={strengthExercise}
                onChange={(e) => setStrengthExercise(e.target.value)}
                placeholder="O escribe tu ejercicio objetivo..."
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-base text-white focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <span className="block text-[10px] text-neutral-400 uppercase">
                    Marca Hoy ({weightUnit})
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={strengthCurrentWeight}
                    onChange={(e) => setStrengthCurrentWeight(e.target.value)}
                    className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/40">
                  <span className="block text-[10px] text-amber-400 uppercase font-bold">
                    Meta Mes 4 ({weightUnit})
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={strengthTargetWeight}
                    onChange={(e) => setStrengthTargetWeight(e.target.value)}
                    className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Objetivo de Dominio Corporal */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                3. Objetivo de Dominio Corporal
              </span>

              <div className="flex flex-wrap gap-1.5">
                {MASTERY_PRESETS.map((sk) => (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => setMasterySkill(sk)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                      masterySkill === sk
                        ? "bg-sky-500 text-black font-bold border-sky-400"
                        : "bg-white/5 border-white/10 text-neutral-300"
                    }`}
                  >
                    {sk}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <span className="block text-[10px] text-neutral-400 uppercase">
                    Nivel Actual
                  </span>
                  <input
                    type="text"
                    value={masteryCurrentLevel}
                    onChange={(e) => setMasteryCurrentLevel(e.target.value)}
                    className="w-full bg-transparent text-base font-semibold text-white focus:outline-none"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-sky-500/40">
                  <span className="block text-[10px] text-sky-400 uppercase font-bold">
                    Meta Mes 4
                  </span>
                  <input
                    type="text"
                    value={masteryTargetLevel}
                    onChange={(e) => setMasteryTargetLevel(e.target.value)}
                    className="w-full bg-transparent text-base font-semibold text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Objetivo Aeróbico (Opcional) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  4. Objetivo Aeróbico (Opcional)
                </span>
                <button
                  type="button"
                  onClick={() => setAerobicEnabled(!aerobicEnabled)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition ${
                    aerobicEnabled
                      ? "bg-purple-500/20 border-purple-400 text-purple-300"
                      : "bg-white/5 border-white/10 text-neutral-500"
                  }`}
                >
                  {aerobicEnabled ? "Incluido" : "Omitido"}
                </button>
              </div>

              {aerobicEnabled && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="block text-[10px] text-neutral-400 uppercase">
                      Prueba / Reto
                    </span>
                    <input
                      type="text"
                      value={aerobicSkill}
                      onChange={(e) => setAerobicSkill(e.target.value)}
                      className="w-full bg-transparent text-base font-semibold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/40">
                    <span className="block text-[10px] text-purple-400 uppercase font-bold">
                      Marca Meta
                    </span>
                    <input
                      type="text"
                      value={aerobicTargetMark}
                      onChange={(e) => setAerobicTargetMark(e.target.value)}
                      className="w-full bg-transparent text-base font-semibold text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Nivel y Equipamiento */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                Experiencia y Entorno de Entrenamiento
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "beginner", label: "Iniciando" },
                  { id: "intermediate", label: "Intermedio" },
                  { id: "advanced", label: "Avanzado" },
                ].map((lv) => (
                  <button
                    key={lv.id}
                    type="button"
                    onClick={() => setExperienceLevel(lv.id)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      experienceLevel === lv.id
                        ? "bg-red-600 border-red-500 text-white"
                        : "bg-white/5 border-white/10 text-neutral-400"
                    }`}
                  >
                    {lv.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: "full_gym", label: "Gimnasio" },
                  { id: "hybrid_park", label: "Gym + Barras" },
                  { id: "home", label: "En Casa" },
                ].map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => setEquipmentAccess(eq.id)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                      equipmentAccess === eq.id
                        ? "bg-white text-black border-white"
                        : "bg-white/5 border-white/10 text-neutral-400"
                    }`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Molestias o Lesiones Articulares */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                ¿Tienes alguna molestia articular actual?
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INJURY_OPTIONS.map((inj) => {
                  const active = selectedInjuries.includes(inj);
                  return (
                    <button
                      key={inj}
                      type="button"
                      onClick={() => toggleInjury(inj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        active
                          ? "bg-red-500/20 border-red-500 text-red-200"
                          : "bg-white/5 border-white/10 text-neutral-400"
                      }`}
                    >
                      {inj}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={injuryNotes}
                onChange={(e) => setInjuryNotes(e.target.value)}
                placeholder="Detalle opcional (ej. molestia en hombro derecho al bajar)..."
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-base text-white focus:outline-none"
              />
            </div>

            {/* Alimentación e Hidratación */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4" />
                  Alimentación e Hidratación
                </span>
                <span className="text-xs font-bold text-sky-300">
                  Meta Agua: {waterLitersPreview} L / día
                </span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-1.5">
                  ¿Cuántas comidas sólidas/líquidas puedes hacer al día?
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMealsPerDay(m)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        mealsPerDay === m
                          ? "bg-sky-500 text-black border-sky-400"
                          : "bg-white/5 border-white/10 text-neutral-400"
                      }`}
                    >
                      {m} comidas
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-1.5">
                  Tu mayor reto con la comida:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    "Falta de tiempo para medir porciones",
                    "Ansiedad / Hambre en la noche",
                    "Me cuesta comer suficiente para subir",
                    "Desorden los fines de semana",
                  ].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setNutritionWeakness(w)}
                      className={`p-2 rounded-xl text-left text-[11px] font-medium border transition ${
                        nutritionWeakness === w
                          ? "bg-sky-500/20 border-sky-400 text-white"
                          : "bg-white/5 border-white/10 text-neutral-400"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Pilar Recuperación: Dormir a la misma hora */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Moon className="w-4 h-4" />
                  Tu Horario de Sueño
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    sleepHoursTarget >= 7 && sleepHoursTarget <= 9
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {sleepHoursTarget} horas de sueño
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Lo más importante para recuperarte es{" "}
                <strong>acostarte y levantarte todos los días a la misma hora</strong>{" "}
                (con máximo 1 hora de diferencia), durmiendo entre 7 y 8 horas.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <label className="block text-[10px] font-bold uppercase text-indigo-300 mb-1">
                    Hora de Acostarte
                  </label>
                  <input
                    type="time"
                    value={targetBedtime}
                    onChange={(e) => setTargetBedtime(e.target.value)}
                    className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <label className="block text-[10px] font-bold uppercase text-indigo-300 mb-1">
                    Hora de Levantarte
                  </label>
                  <input
                    type="time"
                    value={targetWakeTime}
                    onChange={(e) => setTargetWakeTime(e.target.value)}
                    className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Psicología y Compromiso */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                ¿Qué te ha hecho abandonar o estancarte antes?
              </label>
              <textarea
                rows={2}
                value={pastObstacle}
                onChange={(e) => setPastObstacle(e.target.value)}
                placeholder="Ej: No veía el porqué de las rutinas, me aburría o no tenía seguimiento..."
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-base text-white focus:outline-none resize-none"
              />

              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-neutral-300">
                    Nivel de compromiso para estos 120 días:
                  </span>
                  <span className="text-sm font-black text-red-400">
                    {commitmentScore} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={10}
                  value={commitmentScore}
                  onChange={(e) => setCommitmentScore(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/15 via-white/[0.03] to-transparent border border-red-500/30 space-y-2">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Tu Plan Inicial para Revisar con tu Entrenador
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Tu Entrenador revisará estas metas contigo para ajustarlas y acompañarte semana a semana durante estos <strong>120 días</strong>:
              </p>
            </div>

            {/* Resumen de los 4 Objetivos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                    1. Peso y Físico
                  </span>
                  <p className="text-sm font-bold text-white">
                    {weight} {weightUnit} → {targetWeight} {weightUnit} (
                    {weeklyDeltaLabel})
                  </p>
                </div>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">
                    2. Fuerza
                  </span>
                  <p className="text-sm font-bold text-white">
                    {strengthExercise}: {strengthCurrentWeight} →{" "}
                    {strengthTargetWeight} {weightUnit}
                  </p>
                </div>
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-sky-400 block">
                    3. Dominio de tu Cuerpo
                  </span>
                  <p className="text-sm font-bold text-white">
                    {masterySkill}: {masteryTargetLevel}
                  </p>
                </div>
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
              </div>

              {aerobicEnabled && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-400 block">
                      4. Resistencia / Cardio
                    </span>
                    <p className="text-sm font-bold text-white">
                      {aerobicSkill}: {aerobicTargetMark}
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                </div>
              )}
            </div>

            {/* Tus 3 Compromisos Diarios */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                Tus 3 Hábitos Diarios para Lograrlo:
              </span>
              <ul className="text-xs text-neutral-300 space-y-1.5">
                <li>
                  • <strong>Entrenar:</strong> {trainingDaysPerWeek} días por semana ({minutesPerSession} min por sesión).
                </li>
                <li>
                  • <strong>Comer y tomar agua:</strong> Registrar tus{" "}
                  {mealsPerDay} comidas y tomar{" "}
                  <strong>{waterLitersPreview} Litros de agua</strong> al día.
                </li>
                <li>
                  • <strong>Dormir a la misma hora:</strong>{" "}
                  <strong>{sleepHoursTarget} horas</strong> ({targetBedtime} a{" "}
                  {targetWakeTime}), sin variar más de 1 hora.
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Botón Inferior Grande para el Pulgar */}
      <footer className="pt-2">
        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-condensed font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition"
          >
            <span>Siguiente paso</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-condensed font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 disabled:opacity-50 transition"
          >
            <span>
              {submitting
                ? "Guardando tu plan..."
                : "🚀 Empezar Mis 120 Días"}
            </span>
          </button>
        )}
      </footer>
    </div>
  );
}
