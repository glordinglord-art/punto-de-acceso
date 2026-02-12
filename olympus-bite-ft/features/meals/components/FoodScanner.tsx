'use client';

import { useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { mealsService } from '@/features/meals/services/meals.service';
import { MEAL_TYPES } from '@/shared/lib/constants';
import { FITNESS_GOALS, GOAL_RATING_CONFIG } from '../types/meals.types';
import type { FoodAnalysis, FitnessGoal } from '../types/meals.types';

interface FoodScannerProps {
  userId: string;
  onMealSaved: () => void;
  onClose: () => void;
}

type Mode = 'choose' | 'scan' | 'manual' | 'info';

export function FoodScanner({ userId, onMealSaved, onClose }: FoodScannerProps) {
  const [mode, setMode] = useState<Mode>('choose');

  /* ─── Scan state ────────────────────────── */
  const [preview, setPreview] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [savingFromScan, setSavingFromScan] = useState(false);
  const [scanMealType, setScanMealType] = useState<string>('lunch');
  const [scanName, setScanName] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('mantenimiento');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Manual state ──────────────────────── */
  const [manualName, setManualName] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualType, setManualType] = useState<string>('lunch');
  const [manualCal, setManualCal] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualFoods, setManualFoods] = useState('');
  const [savingManual, setSavingManual] = useState(false);

  const [error, setError] = useState('');

  /* ─── Scan handlers ─────────────────────── */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setBase64Data(result);
      setAnalysis(null);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!base64Data) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await mealsService.analyzePhoto(base64Data, fitnessGoal);
      setAnalysis(res.data);
      // Pre-fill name from description
      if (res.data.description) {
        setScanName(res.data.foods.slice(0, 2).join(' + '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analizando imagen');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveFromScan = async () => {
    if (!analysis) return;
    setSavingFromScan(true);
    setError('');
    try {
      await mealsService.create(userId, {
        name: scanName || analysis.foods.slice(0, 2).join(' + '),
        description: analysis.description,
        mealType: scanMealType,
        imageBase64: base64Data ?? undefined,
        foods: analysis.foods,
        calories: analysis.nutritionalInfo.calories,
        protein: analysis.nutritionalInfo.protein,
        carbs: analysis.nutritionalInfo.carbs,
        fat: analysis.nutritionalInfo.fat,
        fiber: analysis.nutritionalInfo.fiber,
        sugar: analysis.nutritionalInfo.sugar,
        recommendation: analysis.recommendation,
        goalRating: analysis.goalRating,
      });
      onMealSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando comida');
    } finally {
      setSavingFromScan(false);
    }
  };

  /* ─── Manual handlers ───────────────────── */

  const handleSaveManual = async () => {
    if (!manualName.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setSavingManual(true);
    setError('');
    try {
      const foodsArr = manualFoods
        .split(',')
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
      });
      onMealSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando comida');
    } finally {
      setSavingManual(false);
    }
  };

  /* ─── Info-only analyze handler ──────────── */
  const handleAnalyzeInfo = async () => {
    if (!base64Data) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await mealsService.analyzePhoto(base64Data, fitnessGoal);
      setAnalysis(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analizando imagen');
    } finally {
      setAnalyzing(false);
    }
  };

  /* ─── Choose mode ───────────────────────── */
  if (mode === 'choose') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
          ¿Qué quieres hacer?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('scan')}
            className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 p-6 transition-all hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <span className="text-2xl">📸</span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-neutral-900 dark:text-white">Escanear y guardar</p>
              <p className="text-xs text-neutral-500 mt-1">IA analiza + registra</p>
            </div>
          </button>
          <button
            onClick={() => setMode('info')}
            className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 p-6 transition-all hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-neutral-900 dark:text-white">Solo info</p>
              <p className="text-xs text-neutral-500 mt-1">Ver macros y consejo IA</p>
            </div>
          </button>
          <button
            onClick={() => setMode('manual')}
            className="col-span-2 flex items-center justify-center gap-3 rounded-2xl border border-neutral-200 px-6 py-4 transition-all hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <span className="text-xl">✍️</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-neutral-900 dark:text-white">Registro manual</p>
              <p className="text-xs text-neutral-500">Ingresa los datos tú mismo</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* ─── Info-only mode ────────────────────── */
  if (mode === 'info') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setMode('choose'); setPreview(null); setAnalysis(null); setBase64Data(null); }}
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          ← Volver
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2 dark:bg-purple-900/20">
          <span className="text-lg">🔍</span>
          <p className="text-xs text-purple-700 dark:text-purple-300">
            <span className="font-semibold">Modo consulta</span> — Solo verás info y sugerencias, sin guardar nada.
          </p>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/30 p-12 text-center transition-colors hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:bg-purple-900/10 dark:hover:border-purple-700"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
              <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Toma una foto para consultar
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Te diremos macros + recomendación
            </p>
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Food preview" className="w-full h-48 object-cover" />
            <button
              onClick={() => { setPreview(null); setAnalysis(null); setBase64Data(null); }}
              aria-label="Eliminar imagen"
              className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Seleccionar foto"
        />

        {preview && !analysis && (
          <>
            {/* Goal Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                🎯 ¿Cuál es tu objetivo?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(FITNESS_GOALS) as [FitnessGoal, typeof FITNESS_GOALS[FitnessGoal]][]).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFitnessGoal(key)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                      fitnessGoal === key
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 ring-2 ring-neutral-900 dark:ring-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    <span className="text-lg">{val.icon}</span>
                    <div>
                      <p className="font-semibold">{val.label}</p>
                      <p className={`text-[11px] ${fitnessGoal === key ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'}`}>
                        {val.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleAnalyzeInfo} fullWidth loading={analyzing} size="lg" className="bg-purple-600! hover:bg-purple-700!">
              {analyzing ? 'Consultando IA...' : '🔍 Consultar información'}
            </Button>
          </>
        )}

        {/* Info Results */}
        {analysis && (
          <>
            <Card className="border-purple-100 bg-purple-50/30 dark:border-purple-900/30 dark:bg-purple-900/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-purple-600 text-lg">🔍</span>
                <h3 className="font-semibold text-neutral-900 dark:text-white">Resultado de consulta</h3>
                <span className="ml-auto text-xs text-neutral-400">
                  {Math.round(analysis.confidence * 100)}% confianza
                </span>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                {analysis.description}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">{analysis.nutritionalInfo.calories}</p>
                  <p className="text-[11px] text-neutral-400">kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">{analysis.nutritionalInfo.protein}g</p>
                  <p className="text-[11px] text-neutral-400">proteína</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-600">{analysis.nutritionalInfo.carbs}g</p>
                  <p className="text-[11px] text-neutral-400">carbos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-rose-600">{analysis.nutritionalInfo.fat}g</p>
                  <p className="text-[11px] text-neutral-400">grasas</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">{analysis.nutritionalInfo.fiber}g</p>
                  <p className="text-[11px] text-neutral-400">fibra</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-600">{analysis.nutritionalInfo.sugar}g</p>
                  <p className="text-[11px] text-neutral-400">azúcar</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {analysis.foods.map((food, i) => (
                  <span key={i} className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm dark:bg-neutral-800 dark:text-neutral-300">
                    {food}
                  </span>
                ))}
              </div>
            </Card>

            {/* Recommendation */}
            {analysis.recommendation && (
              <Card className={`${GOAL_RATING_CONFIG[analysis.goalRating || 'buena'].bgColor} border-transparent`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{GOAL_RATING_CONFIG[analysis.goalRating || 'buena'].icon}</span>
                  <h3 className={`text-sm font-semibold ${GOAL_RATING_CONFIG[analysis.goalRating || 'buena'].color}`}>
                    Para {FITNESS_GOALS[fitnessGoal].label}: {GOAL_RATING_CONFIG[analysis.goalRating || 'buena'].label}
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

            {/* Actions */}
            <div className="sticky bottom-0 -mx-6 -mb-5 mt-3 border-t border-neutral-100 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={onClose}>
                  Listo, cerrar
                </Button>
                <Button fullWidth onClick={() => { setMode('scan'); }}>
                  📸 Quiero guardarla
                </Button>
              </div>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  /* ─── Manual mode ───────────────────────── */
  if (mode === 'manual') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setMode('choose')}
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
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
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
        onClick={() => setMode('choose')}
        className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        ← Volver
      </button>

      {/* Upload Area */}
      {!preview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-12 text-center transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-700">
            <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            Toma una foto de tu comida
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            o selecciona una imagen
          </p>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Food preview" className="w-full h-48 object-cover" />
          <button
            onClick={() => { setPreview(null); setAnalysis(null); setBase64Data(null); }}
            aria-label="Eliminar imagen"
            className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Seleccionar foto de comida"
      />

      {preview && !analysis && (
        <>
          {/* Fitness Goal Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              🎯 ¿Cuál es tu objetivo?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(FITNESS_GOALS) as [FitnessGoal, typeof FITNESS_GOALS[FitnessGoal]][]).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFitnessGoal(key)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    fitnessGoal === key
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 ring-2 ring-neutral-900 dark:ring-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  <span className="text-lg">{val.icon}</span>
                  <div>
                    <p className="font-semibold">{val.label}</p>
                    <p className={`text-[11px] ${fitnessGoal === key ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'}`}>
                      {val.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleAnalyze} fullWidth loading={analyzing} size="lg">
            {analyzing ? 'Analizando con IA...' : '🔍 Analizar comida'}
          </Button>
        </>
      )}

      {/* Analysis Result */}
      {analysis && (
        <>
          <Card className="border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-900/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-600 text-lg">✨</span>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Análisis completado</h3>
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
                <p className="text-xl font-bold text-blue-600">{analysis.nutritionalInfo.protein}g</p>
                <p className="text-[11px] text-neutral-400">proteína</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-amber-600">{analysis.nutritionalInfo.carbs}g</p>
                <p className="text-[11px] text-neutral-400">carbos</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-rose-600">{analysis.nutritionalInfo.fat}g</p>
                <p className="text-[11px] text-neutral-400">grasas</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">{analysis.nutritionalInfo.fiber}g</p>
                <p className="text-[11px] text-neutral-400">fibra</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600">{analysis.nutritionalInfo.sugar}g</p>
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
            <Card className={`${GOAL_RATING_CONFIG[analysis.goalRating || 'buena'].bgColor} border-transparent`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{GOAL_RATING_CONFIG[analysis.goalRating || 'buena'].icon}</span>
                <h3 className={`text-sm font-semibold ${GOAL_RATING_CONFIG[analysis.goalRating || 'buena'].color}`}>
                  Para tu objetivo ({FITNESS_GOALS[fitnessGoal].label}): {GOAL_RATING_CONFIG[analysis.goalRating || 'buena'].label}
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
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {val.icon} {val.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button fullWidth loading={savingFromScan} onClick={handleSaveFromScan} size="lg">
              💾 Guardar comida
            </Button>
          </div>
        </>
      )}

      {error && !analysis && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
