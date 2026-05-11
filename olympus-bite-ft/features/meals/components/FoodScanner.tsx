"use client";

import { useState, useRef } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Card } from "@/shared/components/ui/Card";
import { mealsService } from "@/features/meals/services/meals.service";
import { MEAL_TYPES } from "@/shared/lib/constants";
import { FITNESS_GOALS, GOAL_RATING_CONFIG } from "../types/meals.types";
import type { FoodAnalysis, FitnessGoal } from "../types/meals.types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getLocalDateString, localDateToISO } from "@/shared/lib/utils";

interface FoodScannerProps {
  userId: string;
  onMealSaved: () => void;
}

type Mode = "choose" | "scan" | "manual";

export function FoodScanner({
  userId,
  onMealSaved,
}: FoodScannerProps) {
  const [mode, setMode] = useState<Mode>("choose");

  /* ─── Scan state ────────────────────────── */
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [userDescription, setUserDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [savingFromScan, setSavingFromScan] = useState(false);
  const [scanMealType, setScanMealType] = useState<string>("lunch");
  const [scanName, setScanName] = useState("");
  const { user } = useAuth();
  const [scanDate, setScanDate] = useState(() => getLocalDateString());
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Manual state ──────────────────────── */
  const [manualName, setManualName] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualType, setManualType] = useState<string>("lunch");
  const [manualCal, setManualCal] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualFoods, setManualFoods] = useState("");
  const [savingManual, setSavingManual] = useState(false);

  const [error, setError] = useState("");

  /* ─── Scan handlers ─────────────────────── */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Read all selected files as base64
    const readers = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setImagesBase64((prev) => [...prev, ...results]);
      setAnalysis(null);
      setError("");
    });
  };

  const removeImage = (index: number) => {
    setImagesBase64((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!imagesBase64.length) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await mealsService.analyzePhoto(imagesBase64, {
        goal: user?.dietaryGoal || "No especificado",
        description: userDescription,
        weight: user?.weight ?? undefined,
        height: user?.height ?? undefined,
        experienceLevel: user?.experienceLevel || undefined,
        medicalConditions: user?.medicalConditions || undefined,
        dietaryPreferences: user?.dietaryPreferences || undefined,
      });
      setAnalysis(res.data);
      // Pre-fill name from description
      if (res.data.description) {
        setScanName(res.data.foods.slice(0, 2).join(" + "));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error analizando imagen");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveFromScan = async () => {
    if (!analysis) return;
    setSavingFromScan(true);
    setError("");
    try {
      await mealsService.create(userId, {
        name: scanName || analysis.foods.slice(0, 2).join(" + "),
        description: analysis.description,
        mealType: scanMealType,
        imagesBase64: imagesBase64.length > 0 ? imagesBase64 : undefined,
        foods: analysis.foods,
        calories: analysis.nutritionalInfo.calories,
        protein: analysis.nutritionalInfo.protein,
        carbs: analysis.nutritionalInfo.carbs,
        fat: analysis.nutritionalInfo.fat,
        fiber: analysis.nutritionalInfo.fiber,
        sugar: analysis.nutritionalInfo.sugar,
        recommendation: analysis.recommendation,
        goalRating: analysis.goalRating,
date: localDateToISO(scanDate),
      });
      onMealSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando comida");
    } finally {
      setSavingFromScan(false);
    }
  };

  /* ─── Manual handlers ───────────────────── */

  const handleSaveManual = async () => {
    if (!manualName.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSavingManual(true);
    setError("");
    try {
      const foodsArr = manualFoods
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      await mealsService.create(userId, {
        name: manualName.trim(),
        description: manualDesc.trim(),
        mealType: manualType,
        foods: foodsArr.length > 0 ? foodsArr : undefined,
        calories: Number(manualCal) || 0,
        protein: Number(manualProtein) || 0,
        carbs: Number(manualCarbs) || 0,
        fat: Number(manualFat) || 0,
        date: localDateToISO(scanDate),
      });
      onMealSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando comida");
    } finally {
      setSavingManual(false);
    }
  };

  /* ─── Info-only mode ────────────────────── */
  // The Info-only mode has been removed as per the latest requirements

  /* ─── Manual mode ───────────────────────── */
  if (mode === "manual") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setMode("choose")}
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          ← Volver
        </button>

        <Input
          label="Nombre de la comida"
          placeholder="Ej: Pollo con arroz y ensalada"
          value={manualName}
          onChange={(e) => setManualName(e.target.value)}
        />
        <Input
          label="Descripción (opcional)"
          placeholder="Detalles adicionales..."
          value={manualDesc}
          onChange={(e) => setManualDesc(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Tipo de comida
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MEAL_TYPES).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => setManualType(key)}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                  manualType === key
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                {val.icon} {val.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Calorías (kcal)"
            type="number"
            placeholder="450"
            value={manualCal}
            onChange={(e) => setManualCal(e.target.value)}
          />
          <Input
            label="Proteínas (g)"
            type="number"
            placeholder="30"
            value={manualProtein}
            onChange={(e) => setManualProtein(e.target.value)}
          />
          <Input
            label="Carbos (g)"
            type="number"
            placeholder="40"
            value={manualCarbs}
            onChange={(e) => setManualCarbs(e.target.value)}
          />
          <Input
            label="Grasas (g)"
            type="number"
            placeholder="15"
            value={manualFat}
            onChange={(e) => setManualFat(e.target.value)}
          />
        </div>

        <Input
          label="Alimentos (separados por coma)"
          placeholder="Pollo, Arroz integral, Brócoli"
          value={manualFoods}
          onChange={(e) => setManualFoods(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button fullWidth loading={savingManual} onClick={handleSaveManual}>
          💾 Guardar comida
        </Button>
      </div>
    );
  }

  /* ─── Scan mode ─────────────────────────── */
  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          setMode("choose");
          setImagesBase64([]);
          setAnalysis(null);
          setUserDescription("");
        }}
        className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        ← Volver
      </button>

      {/* Upload Area */}
      {imagesBase64.length === 0 ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-12 text-center transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 border border-white/5 shadow-inner">
            <span className="text-4xl drop-shadow-md">📸</span>
          </div>
          <p className="text-base font-bold font-condensed tracking-wide uppercase text-neutral-800 dark:text-neutral-200">
            Toma fotos de tu comida
          </p>
          <p className="text-xs font-semibold text-neutral-400 mt-1.5 uppercase tracking-wider">
            Sube hasta 4 fotos para mayor precisión
          </p>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {imagesBase64.map((img, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => removeImage(i)}
                  aria-label="Eliminar imagen"
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            {imagesBase64.length < 4 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/20 h-32 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
              >
                <span className="text-xl mb-1">➕</span>
                <span className="text-xs font-medium">Añadir más</span>
              </button>
            )}
          </div>

          {!analysis && (
            <div className="space-y-2">
              <label className="block text-sm font-bold font-condensed tracking-widest uppercase text-neutral-800 dark:text-neutral-200">
                📝 Describe los ingredientes <span className="opacity-60">(Opcional)</span>
              </label>
              <textarea
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="Ayuda a la IA a ser más precisa (ej: 'Pollo con arroz y brócoli')..."
                className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-white/10 dark:bg-white/5 dark:text-white mt-1 backdrop-blur-md transition-colors placeholder:text-neutral-400"
                rows={3}
              />
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Seleccionar foto de comida"
      />

      {imagesBase64.length > 0 && !analysis && (
        <>
          {/* Fitness Goal Display */}
          <div className="space-y-2">
            <label className="block text-sm font-bold font-condensed tracking-widest uppercase text-neutral-800 dark:text-neutral-200">
              🎯 Objetivo actual
            </label>
            <div className="flex items-center gap-3 rounded-xl bg-white/50 dark:bg-white/5 px-4 py-3 border border-neutral-200 dark:border-white/10 backdrop-blur-md">
              <span className="text-3xl drop-shadow-md">
                {user?.dietaryGoal
                  ? FITNESS_GOALS[user.dietaryGoal as FitnessGoal]?.icon || "🎯"
                  : "🎯"}
              </span>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                  {user?.dietaryGoal
                    ? FITNESS_GOALS[user.dietaryGoal as FitnessGoal]?.label ||
                      user.dietaryGoal
                    : "No especificado"}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Se usará para la evaluación de la IA
                </p>
              </div>
              <span className="ml-auto text-[10px] uppercase font-bold text-neutral-400 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md shadow-sm border border-neutral-100 dark:border-neutral-800">
                Automático
              </span>
            </div>
          </div>

          {/* AI Context Info Display */}
          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              🧠 Contexto de IA
            </label>
            <div className="flex items-center gap-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 px-4 py-3 border border-blue-100 dark:border-blue-800/30">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                  Perfil Personalizado
                </p>
                <p className="text-[11px] text-blue-700/80 dark:text-blue-300/70 leading-tight mt-0.5">
                  La IA utilizará tu peso, estatura y condiciones médicas para
                  darte una recomendación a la medida.
                </p>
              </div>
              <span className="ml-auto text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md shadow-sm border border-blue-100 dark:border-blue-800/50">
                Activo
              </span>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            fullWidth
            loading={analyzing}
            size="lg"
          >
            {analyzing ? "Analizando con IA..." : "🔍 Analizar comida"}
          </Button>
        </>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-primary-500/20 bg-primary-500/5 backdrop-blur-md shadow-lg shadow-primary-500/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-5 text-9xl">✨</div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 border-b border-primary-500/10 pb-3">
                <span className="text-primary-400 text-2xl drop-shadow-md">✨</span>
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white uppercase tracking-wider font-condensed">
                  Análisis completado
                </h3>
                <span className="ml-auto text-xs font-semibold text-primary-500/80 uppercase tracking-widest bg-primary-500/10 px-2 py-1 rounded-full">
                  {Math.round(analysis.confidence * 100)}% certeza
                </span>
              </div>

              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-5 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 italic">
                &quot;{analysis.description}&quot;
              </p>

              <div className="grid grid-cols-3 gap-2 mb-5 bg-black/20 p-2 rounded-2xl border border-white/5">
                <div className="text-center p-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-2xl font-black font-condensed tracking-tight text-neutral-900 dark:text-white drop-shadow-md">
                    {analysis.nutritionalInfo.calories}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">kcal</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-2xl font-black font-condensed tracking-tight text-blue-500 drop-shadow-md">
                    {analysis.nutritionalInfo.protein}g
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">proteína</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-2xl font-black font-condensed tracking-tight text-amber-500 drop-shadow-md">
                    {analysis.nutritionalInfo.carbs}g
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">carbos</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-2xl font-black font-condensed tracking-tight text-rose-500 drop-shadow-md">
                    {analysis.nutritionalInfo.fat}g
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">grasas</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-2xl font-black font-condensed tracking-tight text-green-500 drop-shadow-md">
                    {analysis.nutritionalInfo.fiber}g
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">fibra</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-2xl font-black font-condensed tracking-tight text-purple-500 drop-shadow-md">
                    {analysis.nutritionalInfo.sugar}g
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">azúcar</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {analysis.foods.map((food, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-md border border-white/10"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* AI Recommendation Card */}
          {analysis.recommendation && (
            <Card
              className={`relative overflow-hidden ${GOAL_RATING_CONFIG[analysis.goalRating || "buena"].bgColor} border border-white/10 shadow-xl`}
            >
              <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 text-8xl">
                {GOAL_RATING_CONFIG[analysis.goalRating || "buena"].icon}
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl drop-shadow-md">
                    {GOAL_RATING_CONFIG[analysis.goalRating || "buena"].icon}
                  </span>
                  <h3
                    className={`text-sm font-bold uppercase tracking-wider ${GOAL_RATING_CONFIG[analysis.goalRating || "buena"].color}`}
                  >
                    Para tu objetivo (
                    {user?.dietaryGoal
                      ? FITNESS_GOALS[user.dietaryGoal as FitnessGoal]?.label ||
                        user.dietaryGoal
                      : "No especificado"}
                    ): {GOAL_RATING_CONFIG[analysis.goalRating || "buena"].label}
                  </h3>
                </div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 leading-relaxed">
                  {analysis.recommendation}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 opacity-80">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span>Recomendación por IA</span>
                </div>
              </div>
            </Card>
          )}

          {/* Save form */}
          <div className="mt-6 border-t border-white/10 pt-5 space-y-4">
            <Input
              label="Fecha de la comida"
              type="date"
              value={scanDate}
              onChange={(e) => setScanDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              label="Nombre de la comida"
              placeholder="Ej: Pollo con arroz"
              value={scanName}
              onChange={(e) => setScanName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <div className="space-y-2">
              <label className="block text-sm font-bold font-condensed tracking-widest uppercase text-neutral-800 dark:text-neutral-200">
                Tipo de comida
              </label>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {Object.entries(MEAL_TYPES).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setScanMealType(key)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all border ${
                      scanMealType === key
                        ? "bg-primary-500/20 text-primary-300 border-primary-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    {val.icon} {val.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm font-semibold text-red-500 mt-2">{error}</p>}

            <Button
              fullWidth
              loading={savingFromScan}
              onClick={handleSaveFromScan}
              size="lg"
              className="mt-4 font-condensed font-bold tracking-widest uppercase shadow-lg shadow-primary-500/20"
            >
              💾 Guardar comida
            </Button>
          </div>
        </div>
      )}

      {error && !analysis && <p className="text-sm font-semibold text-red-500">{error}</p>}
    </div>
  );
}
