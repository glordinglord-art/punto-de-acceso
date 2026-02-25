"use client";

import { useState, useRef } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { mealsService } from "@/features/meals/services/meals.service";
import { MEAL_TYPES } from "@/shared/lib/constants";
import { FITNESS_GOALS, GOAL_RATING_CONFIG } from "../types/meals.types";
import type { FoodAnalysis, FitnessGoal } from "../types/meals.types";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface FoodScannerProps {
  userId: string;
  onMealSaved: () => void;
  onClose: () => void;
}

type Mode = "choose" | "scan" | "manual";

export function FoodScanner({
  userId,
  onMealSaved,
  onClose,
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
  const [scanDate, setScanDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
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
        date: new Date(scanDate).toISOString(),
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
        date: new Date(scanDate).toISOString(),
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-700">
            <span className="text-2xl">📸</span>
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            Toma fotos de tu comida
          </p>
          <p className="text-xs text-neutral-400 mt-1">
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
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                📝 Describe los ingredientes (Opcional)
              </label>
              <textarea
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="Ayuda a la IA a ser más precisa..."
                className="w-full rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white mt-1"
                rows={2}
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
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              🎯 Objetivo actual
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 px-4 py-3 border border-neutral-200 dark:border-neutral-700">
              <span className="text-2xl">
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
        <>
          <Card className="border-primary-100 bg-primary-50/30 dark:border-primary-900/30 dark:bg-primary-900/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary-600 text-lg">✨</span>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Análisis completado
              </h3>
              <span className="ml-auto text-xs text-neutral-400">
                {Math.round(analysis.confidence * 100)}% confianza
              </span>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
              {analysis.description}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {analysis.nutritionalInfo.calories}
                </p>
                <p className="text-[11px] text-neutral-400">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">
                  {analysis.nutritionalInfo.protein}g
                </p>
                <p className="text-[11px] text-neutral-400">proteína</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-amber-600">
                  {analysis.nutritionalInfo.carbs}g
                </p>
                <p className="text-[11px] text-neutral-400">carbos</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-rose-600">
                  {analysis.nutritionalInfo.fat}g
                </p>
                <p className="text-[11px] text-neutral-400">grasas</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">
                  {analysis.nutritionalInfo.fiber}g
                </p>
                <p className="text-[11px] text-neutral-400">fibra</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600">
                  {analysis.nutritionalInfo.sugar}g
                </p>
                <p className="text-[11px] text-neutral-400">azúcar</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {analysis.foods.map((food, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {food}
                </span>
              ))}
            </div>
          </Card>

          {/* AI Recommendation Card */}
          {analysis.recommendation && (
            <Card
              className={`${GOAL_RATING_CONFIG[analysis.goalRating || "buena"].bgColor} border-transparent`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {GOAL_RATING_CONFIG[analysis.goalRating || "buena"].icon}
                </span>
                <h3
                  className={`text-sm font-semibold ${GOAL_RATING_CONFIG[analysis.goalRating || "buena"].color}`}
                >
                  Para tu objetivo (
                  {user?.dietaryGoal
                    ? FITNESS_GOALS[user.dietaryGoal as FitnessGoal]?.label ||
                      user.dietaryGoal
                    : "No especificado"}
                  ): {GOAL_RATING_CONFIG[analysis.goalRating || "buena"].label}
                </h3>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {analysis.recommendation}
              </p>
              <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1">
                <span>🤖</span> Recomendación generada por IA
              </div>
            </Card>
          )}

          {/* Sticky save form - always visible at bottom */}
          <div className="sticky bottom-0 -mx-6 -mb-6 mt-3 border-t border-neutral-100 bg-white px-6 pt-4 pb-5 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
            <Input
              label="Fecha de la comida"
              type="date"
              value={scanDate}
              onChange={(e) => setScanDate(e.target.value)}
            />
            <Input
              label="Nombre de la comida"
              placeholder="Ej: Pollo con arroz"
              value={scanName}
              onChange={(e) => setScanName(e.target.value)}
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
                    onClick={() => setScanMealType(key)}
                    className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                      scanMealType === key
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {val.icon} {val.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              fullWidth
              loading={savingFromScan}
              onClick={handleSaveFromScan}
              size="lg"
            >
              💾 Guardar comida
            </Button>
          </div>
        </>
      )}

      {error && !analysis && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
