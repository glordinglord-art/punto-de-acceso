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
import {
  Sparkles,
  Camera,
  FileText,
  RefreshCw,
  Mic,
  MicOff,
  Flame,
  Utensils,
  Hand,
  RotateCcw,
  Sliders,
  X,
  ImageIcon,
} from "lucide-react";
import { compressImageFile } from "../utils/image-compression";

interface FoodScannerProps {
  userId: string;
  onMealSaved: () => void;
  defaultMealType?: string;
  onAnalyzeBackground?: (images: string[], text: string, mealType: string) => void;
}

type Mode = "choose" | "scan" | "manual";

/* ─── Tipado minimo de la Web Speech API (no estandarizada en lib.dom) ─── */
interface SpeechAlternativeLike {
  transcript: string;
}

interface SpeechResultLike {
  [index: number]: SpeechAlternativeLike;
}

interface SpeechResultListLike {
  length: number;
  [index: number]: SpeechResultLike;
}

interface SpeechResultEventLike {
  results: SpeechResultListLike;
}

interface SpeechErrorEventLike {
  error: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechErrorEventLike) => void) | null;
  onresult: ((event: SpeechResultEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

export function FoodScanner({
  userId,
  onMealSaved,
  defaultMealType = "breakfast",
  onAnalyzeBackground,
}: FoodScannerProps) {
  const [mode, setMode] = useState<Mode>("choose");

  /* ─── Scan state ────────────────────────── */
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [userDescription, setUserDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [savingFromScan, setSavingFromScan] = useState(false);
  const [scanMealType, setScanMealType] = useState<string>(defaultMealType);
  const [scanName, setScanName] = useState("");
  const { user } = useAuth();
  const [scanDate, setScanDate] = useState(() => getLocalDateString());
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  /* ─── Guided Context state (Chips, Voz, Mano Unificados) ─── */
  const [cookingMethod, setCookingMethod] = useState<string | null>(null);
  const [oilLevel, setOilLevel] = useState<string | null>(null);
  const [drinkChoice, setDrinkChoice] = useState<string | null>(null);
  const [sauceChoice, setSauceChoice] = useState<string | null>(null);
  const [proteinPortion, setProteinPortion] = useState<string | null>(null);
  const [carbPortion, setCarbPortion] = useState<string | null>(null);
  const [fatPortion, setFatPortion] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [freeNotes, setFreeNotes] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeDrawer, setActiveDrawer] = useState<"cooking" | "portions" | "drinks" | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const updateCompiledDescription = (updates: {
    cooking?: string | null;
    oil?: string | null;
    drink?: string | null;
    sauce?: string | null;
    protein?: string | null;
    carbs?: string | null;
    fats?: string | null;
    voice?: string;
    notes?: string;
  }) => {
    const c = updates.cooking !== undefined ? updates.cooking : cookingMethod;
    const o = updates.oil !== undefined ? updates.oil : oilLevel;
    const d = updates.drink !== undefined ? updates.drink : drinkChoice;
    const s = updates.sauce !== undefined ? updates.sauce : sauceChoice;
    const p = updates.protein !== undefined ? updates.protein : proteinPortion;
    const cb = updates.carbs !== undefined ? updates.carbs : carbPortion;
    const f = updates.fats !== undefined ? updates.fats : fatPortion;
    const v = updates.voice !== undefined ? updates.voice : voiceTranscript;
    const n = updates.notes !== undefined ? updates.notes : freeNotes;

    const parts: string[] = [];
    if (n && n.trim()) {
      parts.push(n.trim());
    }

    if (c) {
      parts.push(o ? `Cocción: ${c} con ${o}` : `Cocción: ${c}`);
    } else if (o) {
      parts.push(`Grasa/Aceite: ${o}`);
    }

    const portions: string[] = [];
    if (p) portions.push(`Proteína: ${p}`);
    if (cb) portions.push(`Carbohidratos: ${cb}`);
    if (f) portions.push(`Grasas: ${f}`);
    if (portions.length > 0) parts.push(`Porciones: ${portions.join(", ")}`);

    if (d) parts.push(`Bebida: ${d}`);
    if (s) parts.push(`Salsas: ${s}`);
    if (v && v.trim() && (!n || !n.includes(v.trim()))) {
      parts.push(`Voz: "${v.trim()}"`);
    }

    const compiled = parts.join(" | ");
    setUserDescription(compiled);
  };

  const toggleVoiceDictation = () => {
    if (typeof window === "undefined") return;
    setVoiceError(null);

    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition ||
      windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceError(
        "El dictado por voz no está habilitado en este navegador o entorno (requiere HTTPS o Chrome/Safari). Puedes escribir directamente aquí.",
      );
      textareaRef.current?.focus();
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "es-ES";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        const err = event.error;
        if (err === "not-allowed" || err === "service-not-allowed") {
          setVoiceError("Permiso de micrófono bloqueado. Puedes escribir los detalles en el cuadro de texto.");
        } else if (err === "no-speech") {
          setVoiceError("No se detectó sonido. Intenta hablar más cerca o escribe directamente aquí.");
        } else if (err === "network") {
          setVoiceError("Error de red con el reconocimiento de voz. Puedes escribir los detalles.");
        } else {
          setVoiceError("No se pudo iniciar el dictado. Puedes escribir directamente aquí.");
        }
        textareaRef.current?.focus();
      };

      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const text = event.results[lastResultIndex]?.[0]?.transcript?.trim();
        if (text) {
          setFreeNotes((prev) => {
            const next = prev ? `${prev}, ${text}` : text;
            updateCompiledDescription({ notes: next });
            return next;
          });
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceError("No se pudo iniciar el micrófono. Puedes escribir directamente aquí.");
      textareaRef.current?.focus();
    }
  };

  const clearGuidedContext = () => {
    setCookingMethod(null);
    setOilLevel(null);
    setDrinkChoice(null);
    setSauceChoice(null);
    setProteinPortion(null);
    setCarbPortion(null);
    setFatPortion(null);
    setVoiceTranscript("");
    setFreeNotes("");
    setVoiceError(null);
    setActiveDrawer(null);
    setUserDescription("");
  };

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

    // Compress and resize images to prevent exceeding storage quotas
    const compressions = files.map((file) => compressImageFile(file, 1200, 1200, 0.75));

    Promise.all(compressions)
      .then((results) => {
        setImagesBase64((prev) => [...prev, ...results].slice(0, 4));
        setAnalysis(null);
        setError("");
      })
      .catch((err) => {
        console.error("Error comprimiendo imagen:", err);
        setError("Error al procesar la imagen seleccionada");
      });

    // Reset input value so selecting the same file later still triggers onChange
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImagesBase64((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!imagesBase64.length) return;
    
    // If we support background processing, just dispatch and return
    if (onAnalyzeBackground) {
      onAnalyzeBackground(imagesBase64, userDescription, scanMealType);
      return;
    }

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

  /* ─── Analyzing state HUD ───────────────── */
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-6 animate-in fade-in duration-500 relative">
        <style>{`
          @keyframes scanLine {
            0% { top: 0%; opacity: 0.8; }
            50% { top: 100%; opacity: 0.8; }
            100% { top: 0%; opacity: 0.8; }
          }
          .animate-scan-line {
            animation: scanLine 2.5s infinite ease-in-out;
          }
        `}</style>
        
        {/* Holographic scanning box */}
        <div className="relative w-60 h-60 rounded-3xl overflow-hidden border border-primary-500/30 shadow-[0_0_35px_rgba(16,185,129,0.2)] bg-neutral-950 dark:bg-black/60">
          {imagesBase64[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagesBase64[0]}
              alt="Analyzing food"
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600">
              <Camera className="w-12 h-12 animate-pulse" />
            </div>
          )}
          
          {/* Laser Line Animation */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-line" />
          
          {/* Radar scan ripples */}
          <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(16,185,129,0.05)_70%] pointer-events-none animate-pulse" />
          
          {/* Glowing scanner corners */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary-400 rounded-tl-sm" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary-400 rounded-tr-sm" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary-400 rounded-bl-sm" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary-400 rounded-br-sm" />
        </div>

        {/* Status texts with rotating details */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />
            <h3 className="font-bold text-lg uppercase tracking-wider font-condensed text-neutral-900 dark:text-white">
              Analizando tu plato
            </h3>
          </div>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Nuestra Inteligencia Artificial está identificando los ingredientes y calculando valores nutricionales a la medida de tu objetivo...
          </p>
        </div>

        {/* Progress tracker */}
        <div className="w-full max-w-xs p-4 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-left space-y-2 font-mono text-neutral-600 dark:text-neutral-400 shadow-inner">
          <div className="flex items-center gap-2 text-primary-500">
            <span>✔</span>
            <span>Estableciendo conexión con la IA...</span>
          </div>
          <div className="flex items-center gap-2 text-primary-400 animate-pulse">
            <span className="animate-spin">⚡</span>
            <span>Identificando alimentos en la imagen...</span>
          </div>
          <div className="flex items-center gap-2 opacity-40">
            <span>○</span>
            <span>Calculando macronutrientes...</span>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Choose mode ───────────────────────── */
  if (mode === "choose") {
    return (
      <div className="space-y-6 py-4 animate-in fade-in duration-300">
        <div className="text-center space-y-1.5">
          <h3 className="font-bold text-base uppercase tracking-wider font-condensed text-neutral-800 dark:text-white">
            ¿Cómo deseas registrar tu comida?
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Escanea tu plato con Inteligencia Artificial o ingresa los macronutrientes manualmente.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Scan Option */}
          <div className="flex flex-col justify-between p-6 rounded-3xl border border-slate-200 bg-white/50 dark:border-white/5 dark:bg-white/4 space-y-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center shadow-lg shadow-primary-500/20 text-white shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-white">
                  Escanear con IA
                </h4>
                <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                  Toma fotos en vivo o sube fotos previas de tu galería
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode("scan");
                  setTimeout(() => cameraInputRef.current?.click(), 100);
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-600 dark:text-primary-300 border border-primary-500/20 text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Camera className="w-4 h-4" />
                <span>Cámara</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("scan");
                  setTimeout(() => galleryInputRef.current?.click(), 100);
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Galería</span>
              </button>
            </div>
          </div>

          {/* Manual Option */}
          <button
            onClick={() => setMode("manual")}
            className="flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-200 bg-white/50 hover:bg-neutral-50 dark:border-white/5 dark:bg-white/4 dark:hover:bg-white/8 transition-all hover:scale-[1.02] active:scale-[0.98] text-center space-y-4 group shadow-sm cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white transform group-hover:-rotate-6 transition-all duration-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-white">
                Registro Manual
              </h4>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Escribe el nombre, las calorías y los macronutrientes del alimento por tu cuenta.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

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
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Botón 1: Cámara en vivo */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary-500/30 bg-primary-500/5 p-6 text-center transition-all hover:border-primary-500 hover:bg-primary-500/10 hover:shadow-lg hover:shadow-primary-500/10 hover:scale-[1.01] active:scale-[0.99] dark:border-primary-500/20 dark:bg-primary-500/5 dark:hover:border-primary-500/50 cursor-pointer"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-600 text-white shadow-lg shadow-primary-500/25 transition-transform group-hover:scale-110">
                <Camera className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold font-condensed tracking-wider uppercase text-neutral-900 dark:text-white">
                Tomar foto ahora
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Abre la cámara en vivo
              </p>
              <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded-full">
                En tiempo real
              </span>
            </button>

            {/* Botón 2: Subir de la galería */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 p-6 text-center transition-all hover:border-neutral-400 hover:bg-neutral-100 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] dark:border-neutral-700 dark:bg-neutral-800/40 dark:hover:border-neutral-500 dark:hover:bg-neutral-800/80 cursor-pointer"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-110">
                <ImageIcon className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold font-condensed tracking-wider uppercase text-neutral-900 dark:text-white">
                Subir de la galería
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Comidas previas o fotos guardadas
              </p>
              <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                Fotos anteriores
              </span>
            </button>
          </div>

          <p className="text-center text-[11px] font-semibold text-neutral-400 uppercase tracking-wider pt-1">
            📸 Sube hasta 4 fotos para máxima precisión nutricional
          </p>
        </div>
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
              <div className="flex flex-col gap-2 h-32 justify-center">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/15 hover:border-primary-500/60 text-primary-600 dark:text-primary-400 transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <Camera className="w-4 h-4" />
                  <span>+ Cámara</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>+ Galería</span>
                </button>
              </div>
            )}
          </div>

          {!analysis && (
            <div className="space-y-3.5 pt-2">
              {/* CABECERA CON RESET */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold font-condensed tracking-widest uppercase text-neutral-800 dark:text-neutral-200">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                  <span>Detalles guiados del plato</span>
                  <span className="text-[10px] lowercase font-normal opacity-60">(combina libremente)</span>
                </div>

                {userDescription && (
                  <button
                    type="button"
                    onClick={clearGuidedContext}
                    className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpiar todo</span>
                  </button>
                )}
              </div>

              {/* 1. SECCIÓN PRINCIPAL UNIFICADA: ESCRIBIR O DICTAR */}
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/10 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="food-notes-textarea"
                    className="flex items-center gap-1.5 text-xs font-bold font-condensed tracking-wider uppercase text-neutral-800 dark:text-neutral-200"
                  >
                    <span>📝 Descripción o ingredientes</span>
                    <span className="text-[10px] font-normal lowercase text-neutral-400">
                      (escribe o dicta)
                    </span>
                  </label>

                  {freeNotes && (
                    <button
                      type="button"
                      onClick={() => {
                        setFreeNotes("");
                        updateCompiledDescription({ notes: "" });
                      }}
                      className="text-[11px] font-semibold text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Borrar texto</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    id="food-notes-textarea"
                    ref={textareaRef}
                    value={freeNotes}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFreeNotes(val);
                      updateCompiledDescription({ notes: val });
                      if (voiceError) setVoiceError(null);
                    }}
                    placeholder="Ej: Pechuga a la plancha con 5 cucharadas de arroz, ensalada mixta y café negro sin azúcar..."
                    rows={3}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 pr-28 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-white dark:placeholder:text-neutral-500 dark:focus:bg-neutral-900 resize-none transition-all"
                  />

                  {/* Botón de Dictado flotante integrado dentro del cuadro de texto */}
                  <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleVoiceDictation}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                        isListening
                          ? "bg-red-500 text-white shadow-red-500/30 animate-pulse scale-105"
                          : "bg-primary-500 hover:bg-primary-400 text-white shadow-primary-500/20 active:scale-95"
                      }`}
                      title={isListening ? "Toca para detener" : "Toca para dictar por voz"}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 animate-bounce" />
                          <span>Parar</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>Dictar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Banner de estado de escucha */}
                {isListening && (
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-red-500 animate-pulse pt-0.5">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span>🔴 Escuchando... habla con naturalidad (se escribe automáticamente)</span>
                  </div>
                )}

                {/* Banner de error o aviso amigable */}
                {voiceError && !isListening && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] leading-tight">
                    <span className="shrink-0 text-xs">ℹ️</span>
                    <span className="flex-1">{voiceError}</span>
                    <button
                      type="button"
                      onClick={() => setVoiceError(null)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                      title="Cerrar aviso"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  💡 También puedes usar los atajos rápidos de abajo para añadir método y porciones con un solo toque:
                </p>
              </div>

              {/* ATRIBUTOS DE PRECISIÓN: REVELACIÓN PROGRESIVA */}
              <div className="space-y-2 pt-0.5">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[11px] font-bold font-condensed tracking-wider uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-primary-400" />
                    <span>Afinar detalles con atajos (opcional)</span>
                  </span>
                  {(cookingMethod || oilLevel || proteinPortion || carbPortion || fatPortion || drinkChoice || sauceChoice) && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">
                      Personalizado
                    </span>
                  )}
                </div>

                {/* Barra de 3 Píldoras Selectoras Compactas */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Píldora 1: Cocción y Aceite */}
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(activeDrawer === "cooking" ? null : "cooking")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      activeDrawer === "cooking"
                        ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                        : (cookingMethod || oilLevel)
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40"
                        : "bg-white/60 dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span className="truncate">Cocción / Grasa</span>
                    {(cookingMethod || oilLevel) && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>}
                  </button>

                  {/* Píldora 2: Porciones de Mano */}
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(activeDrawer === "portions" ? null : "portions")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      activeDrawer === "portions"
                        ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                        : (proteinPortion || carbPortion || fatPortion)
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40"
                        : "bg-white/60 dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20"
                    }`}
                  >
                    <Hand className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                    <span className="truncate">Porción Mano</span>
                    {(proteinPortion || carbPortion || fatPortion) && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                  </button>

                  {/* Píldora 3: Bebida y Salsas */}
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(activeDrawer === "drinks" ? null : "drinks")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      activeDrawer === "drinks"
                        ? "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20"
                        : (drinkChoice || sauceChoice)
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/40"
                        : "bg-white/60 dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20"
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                    <span className="truncate">Bebida / Salsas</span>
                    {(drinkChoice || sauceChoice) && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>}
                  </button>
                </div>

                {/* Panel Revelado Progresivo */}
                {activeDrawer === "cooking" && (
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Método de cocción y grasa añadida</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveDrawer(null)}
                        className="text-[10px] font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                      >
                        ✕ Cerrar
                      </button>
                    </div>

                    {/* Métodos de cocción */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "Sartén / Plancha", icon: "🍳" },
                        { id: "Airfryer / Horno", icon: "💨" },
                        { id: "Hervido / Vapor", icon: "💧" },
                        { id: "Frito / Rebozado", icon: "🍟" },
                        { id: "Crudo / Fresco", icon: "🥗" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const next = cookingMethod === item.id ? null : item.id;
                            setCookingMethod(next);
                            updateCompiledDescription({ cooking: next });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                            cookingMethod === item.id
                              ? "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400"
                              : "bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.id}</span>
                        </button>
                      ))}
                    </div>

                    {/* Nivel de aceite / grasa */}
                    <div className="pt-1 border-t border-neutral-200/60 dark:border-white/5">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                        Aceite / Grasa añadida:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "Sin aceite / Spray (0 kcal)", label: "🚫 Sin aceite" },
                          { id: "1 cdta de aceite (+45 kcal)", label: "🥄 1 cdta (+45 kcal)" },
                          { id: "1 cda de aceite (+120 kcal)", label: "🥣 1 cda (+120 kcal)" },
                          { id: "Mantequilla / Manteca (+100 kcal)", label: "🧈 Mantequilla (+100 kcal)" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const next = oilLevel === item.id ? null : item.id;
                              setOilLevel(next);
                              updateCompiledDescription({ oil: next });
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                              oilLevel === item.id
                                ? "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400"
                                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeDrawer === "portions" && (
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-blue-500/30 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Hand className="w-3.5 h-3.5" />
                        <span>Porciones según tu mano</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveDrawer(null)}
                        className="text-[10px] font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                      >
                        ✕ Cerrar
                      </button>
                    </div>

                    {/* Proteína */}
                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        🥩 Proteína (Palma):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: "Media palma (~75g)", label: "½ Palma (~75g)" },
                          { id: "1 Palma (~140g)", label: "1 Palma (~140g)" },
                          { id: "1.5 Palmas (~200g)", label: "1.5 Palmas (~200g)" },
                          { id: "2 Palmas (~280g)", label: "2 Palmas (~280g)" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const next = proteinPortion === item.id ? null : item.id;
                              setProteinPortion(next);
                              updateCompiledDescription({ protein: next });
                            }}
                            className={`p-1.5 rounded-xl text-xs text-center font-medium transition-all ${
                              proteinPortion === item.id
                                ? "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 ring-1 ring-blue-400"
                                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Carbohidratos */}
                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        🍚 Carbohidrato (Puño):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: "Medio puño (~90g)", label: "½ Puño (~90g)" },
                          { id: "1 Puño (~160g)", label: "1 Puño (~160g)" },
                          { id: "2 Puños (~320g)", label: "2 Puños (~320g)" },
                          { id: "Cero carbohidratos", label: "🚫 Cero Carbos" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const next = carbPortion === item.id ? null : item.id;
                              setCarbPortion(next);
                              updateCompiledDescription({ carbs: next });
                            }}
                            className={`p-1.5 rounded-xl text-xs text-center font-medium transition-all ${
                              carbPortion === item.id
                                ? "bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400"
                                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grasas y quesos */}
                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        🥑 Grasa / Aguacate (Pulgar):
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "1 Pulgar (~15g)", label: "1 Pulgar (~15g)" },
                          { id: "2 Pulgares (~35g)", label: "2 Pulgares (~35g)" },
                          { id: "Mínima grasa", label: "Mínima grasa" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const next = fatPortion === item.id ? null : item.id;
                              setFatPortion(next);
                              updateCompiledDescription({ fats: next });
                            }}
                            className={`p-1.5 rounded-xl text-xs text-center font-medium transition-all ${
                              fatPortion === item.id
                                ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400"
                                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeDrawer === "drinks" && (
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-purple-500/30 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Bebidas y Salsas adicionales</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveDrawer(null)}
                        className="text-[10px] font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                      >
                        ✕ Cerrar
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Bebida:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "Agua / Infusión (0 kcal)", label: "💧 Agua / Té" },
                          { id: "Gaseosa Zero (0 kcal)", label: "🥤 Gaseosa Zero" },
                          { id: "Jugo natural (+90 kcal)", label: "🧃 Jugo natural" },
                          { id: "Cerveza / Licor (+150 kcal)", label: "🍺 Cerveza" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const next = drinkChoice === item.id ? null : item.id;
                              setDrinkChoice(next);
                              updateCompiledDescription({ drink: next });
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                              drinkChoice === item.id
                                ? "bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20 ring-1 ring-purple-400"
                                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1 border-t border-neutral-200/60 dark:border-white/5">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Salsas / Aderezos:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "Sin salsa / Solo limón y sal", label: "🍋 Solo limón/sal" },
                          { id: "Mayonesa / César (+110 kcal)", label: "🥗 Mayonesa/César" },
                          { id: "Salsa BBQ / Ketchup (+40 kcal)", label: "🥫 BBQ / Ketchup" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const next = sauceChoice === item.id ? null : item.id;
                              setSauceChoice(next);
                              updateCompiledDescription({ sauce: next });
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                              sauceChoice === item.id
                                ? "bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20 ring-1 ring-purple-400"
                                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. NUBE DE ETIQUETAS ACTIVAS COMBINADAS EN TIEMPO REAL */}
              {(() => {
                const activeTags: { id: string; label: string; onRemove: () => void }[] = [];
                if (cookingMethod) {
                  activeTags.push({
                    id: "cooking",
                    label: cookingMethod,
                    onRemove: () => {
                      setCookingMethod(null);
                      updateCompiledDescription({ cooking: null });
                    },
                  });
                }
                if (oilLevel) {
                  activeTags.push({
                    id: "oil",
                    label: oilLevel,
                    onRemove: () => {
                      setOilLevel(null);
                      updateCompiledDescription({ oil: null });
                    },
                  });
                }
                if (proteinPortion) {
                  activeTags.push({
                    id: "protein",
                    label: `🥩 ${proteinPortion}`,
                    onRemove: () => {
                      setProteinPortion(null);
                      updateCompiledDescription({ protein: null });
                    },
                  });
                }
                if (carbPortion) {
                  activeTags.push({
                    id: "carbs",
                    label: `🍚 ${carbPortion}`,
                    onRemove: () => {
                      setCarbPortion(null);
                      updateCompiledDescription({ carbs: null });
                    },
                  });
                }
                if (fatPortion) {
                  activeTags.push({
                    id: "fats",
                    label: `🥑 ${fatPortion}`,
                    onRemove: () => {
                      setFatPortion(null);
                      updateCompiledDescription({ fats: null });
                    },
                  });
                }
                if (drinkChoice) {
                  activeTags.push({
                    id: "drink",
                    label: drinkChoice,
                    onRemove: () => {
                      setDrinkChoice(null);
                      updateCompiledDescription({ drink: null });
                    },
                  });
                }
                if (sauceChoice) {
                  activeTags.push({
                    id: "sauce",
                    label: sauceChoice,
                    onRemove: () => {
                      setSauceChoice(null);
                      updateCompiledDescription({ sauce: null });
                    },
                  });
                }
                if (freeNotes && freeNotes.trim()) {
                  activeTags.push({
                    id: "notes",
                    label: `📝 "${freeNotes.trim().length > 30 ? freeNotes.trim().slice(0, 30) + "..." : freeNotes.trim()}"`,
                    onRemove: () => {
                      setFreeNotes("");
                      updateCompiledDescription({ notes: "" });
                    },
                  });
                }
                if (voiceTranscript) {
                  activeTags.push({
                    id: "voice",
                    label: `🎙️ "${voiceTranscript}"`,
                    onRemove: () => {
                      setVoiceTranscript("");
                      updateCompiledDescription({ voice: "" });
                    },
                  });
                }

                if (activeTags.length === 0 && !userDescription) return null;

                return (
                  <div className="p-3.5 rounded-2xl bg-primary-500/10 border border-primary-500/30 backdrop-blur-md space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Detalles combinados para la IA ({activeTags.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRawText(!showRawText)}
                        className="text-[10px] font-semibold text-primary-400 hover:underline"
                      >
                        {showRawText ? "Ocultar texto" : "✏️ Editar texto"}
                      </button>
                    </div>

                    {/* Tags activas con botón X */}
                    {activeTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {activeTags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-neutral-900/90 text-white border border-primary-500/40 shadow-sm"
                          >
                            <span className="truncate max-w-[200px]">{tag.label}</span>
                            <button
                              type="button"
                              onClick={tag.onRemove}
                              className="p-0.5 rounded-full hover:bg-white/20 text-neutral-400 hover:text-white transition-colors"
                              title="Eliminar"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Vista o edición de texto crudo */}
                    {showRawText ? (
                      <div className="pt-2 space-y-1">
                        <textarea
                          value={userDescription}
                          onChange={(e) => setUserDescription(e.target.value)}
                          placeholder="Texto completo que recibirá la IA..."
                          className="w-full rounded-xl border border-neutral-200 bg-white/80 dark:border-white/10 dark:bg-neutral-900 px-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white"
                          rows={2}
                        />
                        <p className="text-[10px] text-neutral-400">
                          Puedes modificar o añadir cualquier ingrediente a mano.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs font-mono text-neutral-700 dark:text-neutral-200 leading-relaxed break-words pt-1 border-t border-primary-500/20">
                        {userDescription}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Input para cámara en vivo (fuerza cámara trasera en móviles) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Tomar foto con cámara"
      />

      {/* Input para galería (permite elegir fotos guardadas o tomadas previamente) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="Subir foto desde galería"
      />

      {imagesBase64.length > 0 && !analysis && (
        <>
          {/* Selector de Tipo de Comida y Fecha (ideal si se sube foto de horas previas) */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-neutral-50/70 dark:bg-white/5 border border-neutral-200 dark:border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-condensed tracking-widest uppercase text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <span>🍽️ Comida a registrar</span>
              </label>
              <input
                type="date"
                value={scanDate}
                onChange={(e) => setScanDate(e.target.value)}
                className="text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
              {Object.entries(MEAL_TYPES).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setScanMealType(key)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all border text-center flex items-center justify-center gap-1.5 ${
                    scanMealType === key
                      ? "bg-primary-500/20 text-primary-600 dark:text-primary-300 border-primary-500/50 shadow-sm"
                      : "bg-white dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <span>{val.icon}</span>
                  <span>{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botón de Análisis Directo + Micro-línea de Calibración */}
          <div className="space-y-2.5 pt-1">
            <Button
              onClick={handleAnalyze}
              fullWidth
              loading={analyzing}
              size="lg"
              className="py-4 font-condensed font-bold tracking-widest uppercase shadow-lg shadow-primary-500/20 text-sm"
            >
              {analyzing ? "Analizando con IA..." : "🔍 Analizar comida"}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              <Sparkles className="w-3.5 h-3.5 text-primary-400 shrink-0" />
              <span>
                Calibrado con tu perfil
                {user?.dietaryGoal && (
                  <>
                    {" "}•{" "}
                    <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">
                      {FITNESS_GOALS[user.dietaryGoal as FitnessGoal]?.label || user.dietaryGoal}
                    </strong>
                  </>
                )}
              </span>
            </div>
          </div>
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
