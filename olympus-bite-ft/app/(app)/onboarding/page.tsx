"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  clientsService,
  type OnboardingSubmission,
  type OnboardingResult,
} from "@/features/clients/services/clients.service";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  X,
  Sparkles,
  Flame,
  Activity,
  ShieldCheck,
  Droplets,
  Zap,
  Dumbbell,
  Heart,
  Footprints,
  Scale,
  Search,
  SlidersHorizontal,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Loader2,
  Plus,
  Minus,
  Info,
  Bell,
  Target,
  ClipboardList,
  Wand2,
  LogOut,
  Calendar,
  Globe,
} from "lucide-react";

const MONTHS_LIST = [
  { value: 1, label: "ENE", full: "Enero" },
  { value: 2, label: "FEB", full: "Febrero" },
  { value: 3, label: "MAR", full: "Marzo" },
  { value: 4, label: "ABR", full: "Abril" },
  { value: 5, label: "MAY", full: "Mayo" },
  { value: 6, label: "JUN", full: "Junio" },
  { value: 7, label: "JUL", full: "Julio" },
  { value: 8, label: "AGO", full: "Agosto" },
  { value: 9, label: "SEP", full: "Septiembre" },
  { value: 10, label: "OCT", full: "Octubre" },
  { value: 11, label: "NOV", full: "Noviembre" },
  { value: 12, label: "DIC", full: "Diciembre" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser, availableModes, setActiveMode } = useAuth();

  // Paso actual (1 a 27)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);

  // Estados de datos
  const [name, setName] = useState<string>("");
  const [purposes, setPurposes] = useState<string[]>(["fat_loss"]);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthDay, setBirthDay] = useState<number>(15);
  const [birthMonth, setBirthMonth] = useState<number>(6);
  const [birthYear, setBirthYear] = useState<number>(1998);
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(78);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [bodyFat, setBodyFat] = useState<string>("15-19%");
  const [targetWeight, setTargetWeight] = useState<number>(74);
  const [weightBehavior, setWeightBehavior] = useState<
    "stable" | "fluctuating" | "increasing" | "decreasing"
  >("stable");
  const [activityTypes, setActivityTypes] = useState<string[]>(["fuerza", "cardio"]);
  const [strengthFrequency, setStrengthFrequency] = useState<string>("4 veces por semana");
  const [sessionDuration, setSessionDuration] = useState<number>(75);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [habits, setHabits] = useState<string[]>([]);
  const [customMemories, setCustomMemories] = useState<string[]>([]);
  const [country, setCountry] = useState<string>("Colombia");
  const [countrySearch, setCountrySearch] = useState<string>("");
  const [fasting, setFasting] = useState<string>("No");
  const [supplements, setSupplements] = useState<boolean>(false);
  const [jointDiscomfort, setJointDiscomfort] = useState<string[]>(["none"]);
  const [medicalConditions, setMedicalConditions] = useState<string[]>(["none"]);

  // Métricas nutricionales interactivas
  const [recommendedCalories, setRecommendedCalories] = useState<number>(2450);
  const [customCalories, setCustomCalories] = useState<number>(2450);
  const [macroPreset, setMacroPreset] = useState<
    "balanceada" | "mediterranea" | "baja_grasas" | "baja_carbos" | "keto"
  >("balanceada");
  const [macroPercentages, setMacroPercentages] = useState<{
    protein: number;
    fats: number;
    carbs: number;
  }>({ protein: 30, fats: 30, carbs: 40 });
  const [manualMacroUnit, setManualMacroUnit] = useState<"percentage" | "grams">("percentage");

  // Modales
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showCalorieWarningModal, setShowCalorieWarningModal] = useState(false);
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [showExactFatModal, setShowExactFatModal] = useState(false);
  const [exactFatInput, setExactFatInput] = useState("");
  const [showCustomConditionModal, setShowCustomConditionModal] = useState(false);
  const [customConditionText, setCustomConditionText] = useState("");
  const [showCustomFoodPrefModal, setShowCustomFoodPrefModal] = useState(false);
  const [customFoodPrefText, setCustomFoodPrefText] = useState("");
  const [showCustomAllergyModal, setShowCustomAllergyModal] = useState(false);
  const [customAllergyText, setCustomAllergyText] = useState("");

  // Estados de cálculo y resultado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [resultData, setResultData] = useState<OnboardingResult | null>(null);
  const [objectivesOpen, setObjectivesOpen] = useState(true);

  // Precargar información existente del usuario
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.height) setHeight(user.height);
      if (user.weight) setWeight(user.weight);
      if (user.gender === "male" || user.gender === "female") setGender(user.gender);
      if (user.weightUnitPreference === "kg" || user.weightUnitPreference === "lbs") {
        setWeightUnit(user.weightUnitPreference);
      }
      if (user.age) {
        const estYear = new Date().getFullYear() - user.age;
        setBirthYear(estYear);
      }
      if (user.targetCalories) {
        setRecommendedCalories(user.targetCalories);
        setCustomCalories(user.targetCalories);
      }
    }
  }, [user]);

  // Cálculo dinámico de edad en base a fecha de nacimiento
  const calculatedAge = useMemo(() => {
    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const monthDiff = today.getMonth() + 1 - birthMonth;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
      age--;
    }
    return Math.max(14, Math.min(100, age));
  }, [birthYear, birthMonth, birthDay]);

  const daysInSelectedMonth = useMemo(() => {
    return new Date(birthYear, birthMonth, 0).getDate();
  }, [birthYear, birthMonth]);

  useEffect(() => {
    if (birthDay > daysInSelectedMonth) {
      setBirthDay(daysInSelectedMonth);
    }
  }, [daysInSelectedMonth, birthDay]);

  // Gramos calculados en tiempo real
  const calculatedMacros = useMemo(() => {
    const proteinKcal = (customCalories * macroPercentages.protein) / 100;
    const fatsKcal = (customCalories * macroPercentages.fats) / 100;
    const carbsKcal = (customCalories * macroPercentages.carbs) / 100;
    return {
      proteinGrams: Math.round(proteinKcal / 4),
      fatsGrams: Math.round(fatsKcal / 9),
      carbsGrams: Math.round(carbsKcal / 4),
    };
  }, [customCalories, macroPercentages]);

  // Actualizar calorías sugeridas con Mifflin-St Jeor canónico
  useEffect(() => {
    const weightKg = weightUnit === "lbs" ? weight / 2.20462 : weight;
    const bmr =
      gender === "male"
        ? 10 * weightKg + 6.25 * height - 5 * calculatedAge + 5
        : 10 * weightKg + 6.25 * height - 5 * calculatedAge - 161;

    let neatFactor = 1.35;
    if (activityTypes.includes("ninguna")) neatFactor = 1.2;
    else if (activityTypes.includes("fuerza") && activityTypes.includes("cardio")) neatFactor = 1.5;
    else if (activityTypes.includes("fuerza")) neatFactor = 1.4;

    let targetCal = Math.round(bmr * neatFactor);
    if (purposes.includes("fat_loss")) targetCal -= 400;
    else if (purposes.includes("muscle_gain")) targetCal += 300;
    else if (purposes.includes("recomposition")) targetCal -= 150;
    else if (purposes.includes("maintenance")) targetCal += 0;

    setRecommendedCalories(targetCal);
    setCustomCalories(targetCal);
  }, [weight, weightUnit, height, calculatedAge, gender, purposes, activityTypes]);

  // Manejo de macro preset
  const handleSelectMacroPreset = (
    preset: "balanceada" | "mediterranea" | "baja_grasas" | "baja_carbos" | "keto"
  ) => {
    setMacroPreset(preset);
    if (preset === "balanceada") {
      setMacroPercentages({ protein: 30, fats: 30, carbs: 40 });
    } else if (preset === "mediterranea") {
      setMacroPercentages({ protein: 25, fats: 35, carbs: 40 });
    } else if (preset === "baja_grasas") {
      setMacroPercentages({ protein: 25, fats: 20, carbs: 55 });
    } else if (preset === "baja_carbos") {
      setMacroPercentages({ protein: 35, fats: 45, carbs: 20 });
    } else if (preset === "keto") {
      setMacroPercentages({ protein: 25, fats: 70, carbs: 5 });
    }
  };

  // Badge dinámico para objetivo de peso
  const targetWeightBadge = useMemo(() => {
    const diff = targetWeight - weight;
    if (Math.abs(diff) <= 0.5) {
      return { text: "Recomposición corporal", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
    }
    if (diff < 0) {
      if (Math.abs(diff) <= 4) {
        return { text: "Déficit moderado", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
      }
      return { text: "Pérdida considerable", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    }
    if (diff <= 4) {
      return { text: "Ganancia muscular / Superávit", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" };
    }
    return { text: "Fase de volumen", color: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
  }, [targetWeight, weight]);

  // Lista completa de países con código ISO para renderizado consistente de banderas reales en cualquier sistema operativo
  const countries = [
    { name: "Argentina", code: "ar" },
    { name: "Bolivia", code: "bo" },
    { name: "Brasil", code: "br" },
    { name: "Canadá", code: "ca" },
    { name: "Chile", code: "cl" },
    { name: "Colombia", code: "co" },
    { name: "Costa Rica", code: "cr" },
    { name: "Cuba", code: "cu" },
    { name: "Ecuador", code: "ec" },
    { name: "El Salvador", code: "sv" },
    { name: "España", code: "es" },
    { name: "Estados Unidos", code: "us" },
    { name: "Guatemala", code: "gt" },
    { name: "Honduras", code: "hn" },
    { name: "México", code: "mx" },
    { name: "Nicaragua", code: "ni" },
    { name: "Panamá", code: "pa" },
    { name: "Paraguay", code: "py" },
    { name: "Perú", code: "pe" },
    { name: "Puerto Rico", code: "pr" },
    { name: "República Dominicana", code: "do" },
    { name: "Uruguay", code: "uy" },
    { name: "Venezuela", code: "ve" },
    { name: "Otro / Internacional", code: "un" },
  ];

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Total de pantallas activas en el flujo
  const totalScreens = 27;
  const progressPercent = Math.min(100, Math.round((currentStep / totalScreens) * 100));

  // Navegación
  const nextStep = () => {
    setDirection(1);
    if (currentStep === 10 && !activityTypes.includes("fuerza")) {
      // Si no hace fuerza, saltar la pregunta de frecuencia de fuerza
      setCurrentStep(12);
      return;
    }
    if (currentStep === 25) {
      // Pantalla de animación de archivo -> disparar cálculo
      handleGeneratePlan();
      return;
    }
    setCurrentStep((prev) => Math.min(totalScreens, prev + 1));
  };

  const prevStep = () => {
    setDirection(-1);
    if (currentStep === 12 && !activityTypes.includes("fuerza")) {
      setCurrentStep(10);
      return;
    }
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Disparar cálculo clínico IA y animación de 5 iconos
  const handleGeneratePlan = async () => {
    setCurrentStep(26);
    setIsSubmitting(true);

    // Animación de los 5 pasos
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    try {
      if (!user) throw new Error("Sesión no válida");

      // Mapear propósito
      let dietaryGoal:
        | "fat_loss"
        | "muscle_gain"
        | "recomposition"
        | "health_performance"
        | "maintenance" = "fat_loss";
      if (purposes.includes("muscle_gain")) dietaryGoal = "muscle_gain";
      else if (purposes.includes("recomposition")) dietaryGoal = "recomposition";
      else if (purposes.includes("maintenance")) dietaryGoal = "maintenance";

      // Mapear NEAT
      let neatLevel: "sedentary" | "standing" | "heavy_labor" = "standing";
      if (habits.includes("Trabajo sentado") || activityTypes.includes("ninguna"))
        neatLevel = "sedentary";
      else if (sessionDuration >= 90) neatLevel = "heavy_labor";

      // Mapear sueño y estrés
      let sleepQuality: "under_6h" | "6_to_7h" | "7_to_9h_deep" = "6_to_7h";
      if (habits.includes("Duermo menos de 7 h")) sleepQuality = "under_6h";

      let stressLevel: "low" | "moderate" | "high" = "moderate";
      if (habits.includes("Estrés y comida")) stressLevel = "high";

      // Payload integral
      const payload: OnboardingSubmission = {
        displayName: name.trim() || user.name,
        purposes,
        targetWeight,
        medicalConditionsList: medicalConditions.filter((c) => c !== "none"),
        performanceAspects: ["recuperacion", "fuerza"],
        bodyFatPercentage: bodyFat,
        physicalActivityTypes: activityTypes,
        strengthFrequency,
        sessionDurationMinutes: sessionDuration,
        foodPreferences,
        allergiesAndIntolerances: allergies,
        lifestyleHabits: habits,
        country,
        intermittentFasting: fasting,
        takesSupplements: supplements,
        customMemories,
        macroPreset,
        customCalories,
        customProtein: calculatedMacros.proteinGrams,
        customCarbs: calculatedMacros.carbsGrams,
        customFats: calculatedMacros.fatsGrams,
        gender,
        age: calculatedAge,
        height,
        weight,
        weightUnit,
        weightBehavior,
        dietaryGoal,
        experienceLevel: "intermediate",
        equipmentAccess: "commercial_gym",
        jointDiscomfort,
        neatLevel,
        sleepQuality,
        stressLevel,
        anxietyTrigger: habits.includes("Antojos dulces") ? "afternoon" : "none",
        digestiveHealth: allergies.includes("Intolerancia a la lactosa")
          ? "lactose_intolerant"
          : allergies.includes("Gluten")
          ? "gluten_sensitive"
          : "good",
        mealFrequency: fasting !== "No" ? "2_to_3" : "4_to_5",
      };

      const res = await clientsService.submitOnboarding(user.id, payload);
      clearInterval(interval);

      if (res.success && res.data) {
        setResultData(res.data);
        updateUser(res.data.user);
        // Avanzar a la pantalla de entrega del plan
        setCurrentStep(27);
      } else {
        toast.error(res.message || "Error al procesar la anamnesis");
        setCurrentStep(25);
      }
    } catch (err: unknown) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Error al conectar con el servidor";
      toast.error(msg);
      setCurrentStep(25);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAndEnter = () => {
    toast.success("¡Bienvenido a Vital Fit!");
    router.replace("/dashboard");
  };

  // Salir a modo entrenador de forma segura
  const handleExitToCoach = () => {
    setActiveMode("trainer");
    router.replace("/coach");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* HEADER SUPERIOR CON BARRA DE PROGRESO SLIM TIPO PULSO */}
      {currentStep < 26 && (
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/60 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            {/* Botón Atrás */}
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`p-2 rounded-full transition-all ${
                currentStep === 1
                  ? "opacity-0 pointer-events-none"
                  : "hover:bg-zinc-800 text-zinc-300 hover:text-white active:scale-95"
              }`}
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Barra de progreso fina (2.5px) */}
            <div className="flex-1 max-w-xs bg-zinc-800/80 h-1 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>

            {/* Salida segura para modo entrenador */}
            {availableModes && availableModes.length > 1 ? (
              <button
                onClick={handleExitToCoach}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 py-1 px-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 transition-colors"
                title="Volver a modo coach"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modo Coach</span>
              </button>
            ) : (
              <div className="w-8" />
            )}
          </div>
        </header>
      )}

      {/* CONTENEDOR PRINCIPAL DE PANTALLAS (MICRO-SCREENS) */}
      <main className="flex-1 flex flex-col justify-center px-4 py-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 35 : -35 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -35 : 35 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full flex-1 flex flex-col justify-between"
          >
            {/* ========================================================================= */}
            {/* 01. NOMBRE */}
            {/* ========================================================================= */}
            {currentStep === 1 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-6">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Cómo te gustaría que te llamemos?
                  </h1>
                  <p className="text-sm text-zinc-400">Puedes usar tu nombre o un apodo</p>

                  <div className="mt-12 relative max-w-sm mx-auto">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      autoFocus
                      className="w-full bg-transparent border-b-2 border-zinc-700 focus:border-blue-500 py-3 text-2xl font-bold text-center text-white placeholder:text-zinc-600 outline-none transition-colors"
                    />
                    {name && (
                      <button
                        onClick={() => setName("")}
                        className="absolute right-2 top-3 p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-4 text-center">
                    <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Podrás cambiarlo cuando quieras desde tu perfil</span>
                  </div>
                  <button
                    onClick={nextStep}
                    disabled={!name.trim()}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 02. PROPÓSITO (LOS 4 PILARES VITAL FIT) */}
            {/* ========================================================================= */}
            {currentStep === 2 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    Cuéntanos para qué quieres usar Vital Fit
                  </h1>
                  <p className="text-sm text-zinc-400">Selecciona tu objetivo principal</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto w-full">
                  {[
                    {
                      id: "fat_loss",
                      icon: Flame,
                      title: "Perder grasa",
                      desc: "Reducir porcentaje graso y peso de forma sostenible",
                    },
                    {
                      id: "muscle_gain",
                      icon: Dumbbell,
                      title: "Ganar más músculo",
                      desc: "Aumentar masa muscular magra, fuerza y volumen",
                    },
                    {
                      id: "recomposition",
                      icon: Activity,
                      title: "Recomposición corporal",
                      desc: "Perder grasa y construir músculo simultáneamente",
                    },
                    {
                      id: "maintenance",
                      icon: Scale,
                      title: "Mantenimiento",
                      desc: "Mantener tu peso, consolidar hábitos y rendimiento",
                    },
                  ].map((p) => {
                    const isSelected = purposes.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setPurposes([p.id]);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between active:scale-[0.98] ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40"
                            : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            <p.icon className="w-5 h-5" />
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white leading-snug">{p.title}</h3>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    disabled={purposes.length === 0}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 03. SEXO BIOLÓGICO */}
            {/* ========================================================================= */}
            {currentStep === 3 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-4 mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Cuál es tu sexo biológico?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Lo necesitamos para calcular con precisión tu tasa metabólica basal
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto w-full">
                  {[
                    { id: "male", label: "Hombre", icon: "♂️", sub: "Mifflin-St Jeor factor masculino" },
                    { id: "female", label: "Mujer", icon: "♀️", sub: "Mifflin-St Jeor factor femenino" },
                  ].map((s) => {
                    const isSelected = gender === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setGender(s.id as "male" | "female");
                          setTimeout(nextStep, 200);
                        }}
                        className={`p-6 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/40"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="text-5xl mb-3">{s.icon}</div>
                        <h3 className="text-xl font-bold text-white">{s.label}</h3>
                        <p className="text-xs text-zinc-400 mt-1">{s.sub}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 04. FECHA DE NACIMIENTO / EDAD */}
            {/* ========================================================================= */}
            {currentStep === 4 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    Indica tu fecha de nacimiento
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Tu edad influye en tu metabolismo basal y requerimientos nutricionales
                  </p>
                </div>

                <div className="my-auto max-w-sm mx-auto w-full space-y-4">
                  {/* Hero card de fecha seleccionada */}
                  <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 rounded-2xl p-4 text-center shadow-lg shadow-black/20">
                    <div className="flex items-center justify-center gap-1.5 text-zinc-400 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Fecha Seleccionada
                      </span>
                    </div>
                    <p className="text-lg font-bold text-white capitalize">
                      {birthDay} de {MONTHS_LIST[birthMonth - 1]?.full || "Mes"}, {birthYear}
                    </p>
                    <div className="mt-2.5 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold font-mono">
                        <Flame className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                        {calculatedAge} años cumplidos
                      </span>
                    </div>
                    {/* Insight metabólico */}
                    <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/70 border border-zinc-800/60 text-[11px] text-zinc-400">
                      {calculatedAge < 25 && "⚡ Tasa metabólica alta • Alta síntesis proteica y rápida recuperación"}
                      {calculatedAge >= 25 && calculatedAge < 35 && "🔥 Pico de rendimiento biológico • Tasa metabólica basal óptima"}
                      {calculatedAge >= 35 && calculatedAge < 50 && "💪 Eficiencia metabólica • Prioridad en balance hormonal y masa magra"}
                      {calculatedAge >= 50 && "🛡️ Longevidad y salud articular • Preservación muscular activa"}
                    </div>
                  </div>

                  {/* 3 TARJETAS INTERACTIVAS (DÍA, MES, AÑO) */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* DÍA */}
                    <div className="relative bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/90 rounded-2xl p-2.5 flex flex-col items-center justify-between text-center transition-all group shadow-sm">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                        Día
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBirthDay((d) => (d >= daysInSelectedMonth ? 1 : d + 1));
                        }}
                        className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors active:scale-90 my-1"
                        aria-label="Incrementar día"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <div className="relative py-0.5 w-full text-center">
                        <span className="text-3xl font-black text-white tracking-tight">
                          {birthDay < 10 ? `0${birthDay}` : birthDay}
                        </span>
                        {/* Selector nativo invisible para toque directo */}
                        <select
                          value={birthDay}
                          onChange={(e) => setBirthDay(parseInt(e.target.value, 10))}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        >
                          {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d} className="bg-zinc-900 text-white">
                              {d < 10 ? `0${d}` : d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBirthDay((d) => (d <= 1 ? daysInSelectedMonth : d - 1));
                        }}
                        className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors active:scale-90 my-1"
                        aria-label="Decrementar día"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* MES */}
                    <div className="relative bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/90 rounded-2xl p-2.5 flex flex-col items-center justify-between text-center transition-all group shadow-sm">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                        Mes
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBirthMonth((m) => (m >= 12 ? 1 : m + 1));
                        }}
                        className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors active:scale-90 my-1"
                        aria-label="Incrementar mes"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <div className="relative py-0.5 w-full text-center">
                        <span className="text-2xl font-black text-blue-400 tracking-tight block">
                          {MONTHS_LIST[birthMonth - 1]?.label || "ENE"}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium block -mt-0.5">
                          {MONTHS_LIST[birthMonth - 1]?.full || "Enero"}
                        </span>
                        {/* Selector nativo invisible para toque directo */}
                        <select
                          value={birthMonth}
                          onChange={(e) => setBirthMonth(parseInt(e.target.value, 10))}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        >
                          {MONTHS_LIST.map((m) => (
                            <option key={m.value} value={m.value} className="bg-zinc-900 text-white">
                              {m.full}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBirthMonth((m) => (m <= 1 ? 12 : m - 1));
                        }}
                        className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors active:scale-90 my-1"
                        aria-label="Decrementar mes"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* AÑO */}
                    <div className="relative bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/90 rounded-2xl p-2.5 flex flex-col items-center justify-between text-center transition-all group shadow-sm">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                        Año
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBirthYear((y) => Math.min(new Date().getFullYear() - 14, y + 1));
                        }}
                        className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors active:scale-90 my-1"
                        aria-label="Incrementar año"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <div className="relative py-0.5 w-full text-center">
                        <span className="text-2xl font-black text-white tracking-tight">
                          {birthYear}
                        </span>
                        {/* Selector nativo invisible para toque directo */}
                        <select
                          value={birthYear}
                          onChange={(e) => setBirthYear(parseInt(e.target.value, 10))}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        >
                          {Array.from({ length: 70 }, (_, i) => new Date().getFullYear() - 14 - i).map((y) => (
                            <option key={y} value={y} className="bg-zinc-900 text-white">
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBirthYear((y) => Math.max(1930, y - 1));
                        }}
                        className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors active:scale-90 my-1"
                        aria-label="Decrementar año"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Acceso rápido a décadas */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] text-zinc-500 font-mono mr-1">Década:</span>
                    {[
                      { label: "70s", year: 1975 },
                      { label: "80s", year: 1985 },
                      { label: "90s", year: 1995 },
                      { label: "00s", year: 2002 },
                      { label: "10s", year: 2008 },
                    ].map((d) => (
                      <button
                        key={d.label}
                        type="button"
                        onClick={() => setBirthYear(d.year)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-mono transition-all ${
                          birthYear >= d.year - 5 && birthYear <= d.year + 5
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                            : "bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 05. ESTATURA */}
            {/* ========================================================================= */}
            {currentStep === 5 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Cuál es tu estatura?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    La usaremos para estimar tu gasto calórico y superficie corporal
                  </p>
                </div>

                <div className="text-center my-auto py-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-black tracking-tight text-white">{height}</span>
                    <span className="text-2xl font-bold text-zinc-400">cm</span>
                  </div>

                  {/* SLIDER TÁCTIL SUAVE */}
                  <div className="max-w-xs mx-auto mt-10">
                    <input
                      type="range"
                      min={120}
                      max={220}
                      step={1}
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                      <span>120 cm</span>
                      <span>170 cm</span>
                      <span>220 cm</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      onClick={() => setHeight((h) => Math.max(120, h - 1))}
                      className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setHeight((h) => Math.min(220, h + 1))}
                      className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 06. PESO ACTUAL */}
            {/* ========================================================================= */}
            {currentStep === 6 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Cuál es tu peso actual?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Tu punto de partida para diseñar tu estrategia nutricional
                  </p>

                  {/* TOGGLE SWITCH KG / LBS */}
                  <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 mt-4">
                    <button
                      onClick={() => {
                        if (weightUnit === "lbs") {
                          setWeight(Math.round((weight / 2.20462) * 10) / 10);
                          setWeightUnit("kg");
                        }
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        weightUnit === "kg" ? "bg-blue-600 text-white shadow" : "text-zinc-400"
                      }`}
                    >
                      kg
                    </button>
                    <button
                      onClick={() => {
                        if (weightUnit === "kg") {
                          setWeight(Math.round(weight * 2.20462 * 10) / 10);
                          setWeightUnit("lbs");
                        }
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        weightUnit === "lbs" ? "bg-blue-600 text-white shadow" : "text-zinc-400"
                      }`}
                    >
                      lbs
                    </button>
                  </div>
                </div>

                <div className="text-center my-auto py-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-black tracking-tight text-white">{weight}</span>
                    <span className="text-2xl font-bold text-zinc-400">{weightUnit}</span>
                  </div>

                  <div className="max-w-xs mx-auto mt-10">
                    <input
                      type="range"
                      min={weightUnit === "kg" ? 35 : 77}
                      max={weightUnit === "kg" ? 180 : 396}
                      step={0.5}
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      onClick={() => setWeight((w) => Math.max(30, Math.round((w - 0.5) * 10) / 10))}
                      className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setWeight((w) => Math.min(250, Math.round((w + 0.5) * 10) / 10))}
                      className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-4 text-center">
                    <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Podrás actualizar tu peso en cualquier momento desde tus métricas</span>
                  </div>
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 07. PORCENTAJE DE GRASA CORPORAL (SILUETAS ANATÓMICAS CIRCULARES) */}
            {/* ========================================================================= */}
            {currentStep === 7 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Cuál es tu porcentaje de grasa corporal?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Elige la imagen que se aproxime a tu contextura
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto my-auto w-full">
                  {[
                    { label: "Menor a 8%", val: "<8%", icon: "⚡" },
                    { label: "9-14%", val: "9-14%", icon: "💪" },
                    { label: "15-19%", val: "15-19%", icon: "🏃" },
                    { label: "20-24%", val: "20-24%", icon: "🧍" },
                    { label: "25-29%", val: "25-29%", icon: "🚶" },
                    { label: "30-34%", val: "30-34%", icon: "🧘" },
                    { label: "35-39%", val: "35-39%", icon: "⚖️" },
                    { label: "40% o más", val: "40%+", icon: "🛡️" },
                  ].map((bf) => {
                    const isSelected = bodyFat === bf.val;
                    return (
                      <div
                        key={bf.val}
                        onClick={() => setBodyFat(bf.val)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {/* Avatar circular */}
                        <div
                          className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2 transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {bf.icon}
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-600/90 rounded-full flex items-center justify-center">
                              <Check className="w-6 h-6 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-center text-zinc-200">
                          {bf.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowExactFatModal(true)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 py-1.5 px-3 rounded-full bg-blue-500/10 border border-blue-500/20"
                  >
                    Ingresar porcentaje exacto
                  </button>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 08. PESO OBJETIVO (PESO META CON SLIDER Y BADGE DINÁMICA) */}
            {/* ========================================================================= */}
            {currentStep === 8 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Cuál es tu objetivo de peso?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Elige un peso al que te gustaría llegar o mantenerte
                  </p>
                </div>

                <div className="text-center my-auto py-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-black tracking-tight text-white">
                      {targetWeight}
                    </span>
                    <span className="text-2xl font-bold text-zinc-400">{weightUnit}</span>
                  </div>

                  {/* BADGE DINÁMICA SEGÚN DIFERENCIA */}
                  <div className="mt-4">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${targetWeightBadge.color}`}
                    >
                      {targetWeightBadge.text}
                    </span>
                  </div>

                  <div className="max-w-xs mx-auto mt-8">
                    <input
                      type="range"
                      min={weightUnit === "kg" ? 40 : 88}
                      max={weightUnit === "kg" ? 150 : 330}
                      step={0.5}
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => setTargetWeight(weight)}
                    className="mt-6 text-xs text-zinc-400 hover:text-white underline underline-offset-4"
                  >
                    No sé cuál es mi peso objetivo (mantener)
                  </button>
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 09. COMPORTAMIENTO DEL PESO */}
            {/* ========================================================================= */}
            {currentStep === 9 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Cómo se ha comportado tu peso recientemente?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Nos ayuda a identificar tu adaptabilidad y tendencia metabólica
                  </p>
                </div>

                <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
                  {[
                    {
                      id: "stable",
                      icon: "⚖️",
                      title: "Estable",
                      desc: "Se mantiene en el mismo rango sin grandes cambios",
                    },
                    {
                      id: "fluctuating",
                      icon: "🎢",
                      title: "Fluctuante",
                      desc: "Sube y baja con facilidad en cuestión de días o semanas",
                    },
                    {
                      id: "increasing",
                      icon: "📈",
                      title: "Aumentando",
                      desc: "He ganado peso en los últimos meses",
                    },
                    {
                      id: "decreasing",
                      icon: "📉",
                      title: "Disminuyendo",
                      desc: "He perdido peso en los últimos meses",
                    },
                  ].map((b) => {
                    const isSelected = weightBehavior === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setWeightBehavior(
                            b.id as "stable" | "fluctuating" | "increasing" | "decreasing",
                          );
                          setTimeout(nextStep, 150);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{b.icon}</span>
                          <div>
                            <h3 className="text-sm font-bold text-white">{b.title}</h3>
                            <p className="text-xs text-zinc-400">{b.desc}</p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 10. TIPO DE ACTIVIDAD FÍSICA */}
            {/* ========================================================================= */}
            {currentStep === 10 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Qué tipo de actividad física realizas?
                  </h1>
                  <p className="text-sm text-zinc-400">Puedes elegir más de una opción</p>
                </div>

                <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
                  {[
                    {
                      id: "cardio",
                      icon: Activity,
                      title: "Cardio",
                      desc: "Running, caminatas, bici, natación, clases aeróbicas u otras que elevan tu ritmo cardíaco",
                    },
                    {
                      id: "fuerza",
                      icon: Dumbbell,
                      title: "Ejercicio de fuerza",
                      desc: "Pesas, máquinas, calistenia, crossfit u otros ejercicios orientados a ganar músculo",
                    },
                    {
                      id: "ninguna",
                      icon: Footprints,
                      title: "Ninguna",
                      desc: "No tengo una rutina de actividad física actualmente",
                    },
                  ].map((act) => {
                    const isSelected = activityTypes.includes(act.id);
                    return (
                      <div
                        key={act.id}
                        onClick={() => {
                          if (act.id === "ninguna") {
                            setActivityTypes(["ninguna"]);
                          } else {
                            const withoutNone = activityTypes.filter((x) => x !== "ninguna");
                            if (isSelected) {
                              const updated = withoutNone.filter((x) => x !== act.id);
                              setActivityTypes(updated.length ? updated : ["ninguna"]);
                            } else {
                              setActivityTypes([...withoutNone, act.id]);
                            }
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-start gap-3.5 pr-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            <act.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight">{act.title}</h3>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{act.desc}</p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 11. FRECUENCIA DE EJERCICIO DE FUERZA (CONDICIONAL) */}
            {/* ========================================================================= */}
            {currentStep === 11 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Con qué frecuencia realizas ejercicio de fuerza?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Elige el nivel que mejor describa tu rutina actual
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-w-sm mx-auto w-full">
                  {[
                    "1 vez por semana",
                    "2 veces por semana",
                    "3 veces por semana",
                    "4 veces por semana",
                    "5 veces por semana",
                    "6 veces por semana",
                    "7 veces por semana",
                  ].map((freq) => {
                    const isSelected = strengthFrequency === freq;
                    return (
                      <div
                        key={freq}
                        onClick={() => {
                          setStrengthFrequency(freq);
                          setTimeout(nextStep, 150);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <span className="text-sm font-semibold text-zinc-200">{freq}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 12. DURACIÓN DE LA SESIÓN PROMEDIO */}
            {/* ========================================================================= */}
            {currentStep === 12 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Cuánto dura tu sesión promedio?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Elige el nivel que mejor describa tu rutina actual
                  </p>
                </div>

                <div className="text-center my-auto py-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-black tracking-tight text-white">
                      {sessionDuration}
                    </span>
                    <span className="text-2xl font-bold text-zinc-400">min</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-1">Duración de la sesión</p>

                  <div className="max-w-xs mx-auto mt-10">
                    <input
                      type="range"
                      min={30}
                      max={150}
                      step={15}
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                      <span>30 min</span>
                      <span>75 min</span>
                      <span>150 min</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 13. PREFERENCIAS ALIMENTICIAS (NUBE DE CÁPSULAS / PILLS) */}
            {/* ========================================================================= */}
            {currentStep === 13 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Tienes preferencias alimenticias?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Elige las que se parezcan a tu forma de comer, podrás ajustarlas más adelante
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto my-auto py-4">
                  {[
                    "🌿 Vegano",
                    "🥗 Vegetariano",
                    "🐟 Pescetariano",
                    "🍬 Bajo en azúcar",
                    "🧂 Bajo en sodio",
                    "🥛 Bajo en lactosa",
                    "🍟 No como fritos",
                    "🥫 Evito ultraprocesados",
                    "🍳 Cocino sin aceite",
                    "🐷 No como cerdo",
                    "🥩 Evito la carne roja",
                    ...foodPreferences.filter(
                      (p) =>
                        ![
                          "🌿 Vegano",
                          "🥗 Vegetariano",
                          "🐟 Pescetariano",
                          "🍬 Bajo en azúcar",
                          "🧂 Bajo en sodio",
                          "🥛 Bajo en lactosa",
                          "🍟 No como fritos",
                          "🥫 Evito ultraprocesados",
                          "🍳 Cocino sin aceite",
                          "🐷 No como cerdo",
                          "🥩 Evito la carne roja",
                        ].includes(p)
                    ),
                  ].map((pref) => {
                    const isSelected = foodPreferences.includes(pref);
                    return (
                      <button
                        key={pref}
                        onClick={() => {
                          if (isSelected) {
                            setFoodPreferences(foodPreferences.filter((x) => x !== pref));
                          } else {
                            setFoodPreferences([...foodPreferences, pref]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        <span>{pref}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setShowCustomFoodPrefModal(true)}
                    className="px-4 py-2 rounded-full text-xs font-semibold border border-dashed border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Escribir otra opción</span>
                  </button>
                </div>

                <div className="text-center text-xs text-zinc-500 font-mono">
                  {foodPreferences.length} preferencias seleccionadas
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 14. ALERGIAS E INTOLERANCIAS (NUBE DE CÁPSULAS CON ESTADO AZUL) */}
            {/* ========================================================================= */}
            {currentStep === 14 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Tienes alergias, celiaquía o intolerancias?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Selecciona o escribe cuál para excluir lo que no sea adecuado para ti
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto my-auto py-4">
                  {[
                    "🥛 Intolerancia a lactosa",
                    "🐟 Pescado",
                    "🦐 Mariscos",
                    "🥜 Maní",
                    "🌰 Frutos secos",
                    "🫛 Soja",
                    "🧀 Alergia a los lácteos",
                    "🫘 Legumbres",
                    "🌾 Gluten",
                    "🍞 Harinas",
                    "🍽️ Aditivos alimentarios",
                    "🌿 Apio",
                    "🌭 Mostaza",
                    "🌽 Maíz",
                    "🌿 Sésamo",
                    "🌾 Celiaquía",
                    ...allergies.filter(
                      (a) =>
                        ![
                          "🥛 Intolerancia a lactosa",
                          "🐟 Pescado",
                          "🦐 Mariscos",
                          "🥜 Maní",
                          "🌰 Frutos secos",
                          "🫛 Soja",
                          "🧀 Alergia a los lácteos",
                          "🫘 Legumbres",
                          "🌾 Gluten",
                          "🍞 Harinas",
                          "🍽️ Aditivos alimentarios",
                          "🌿 Apio",
                          "🌭 Mostaza",
                          "🌽 Maíz",
                          "🌿 Sésamo",
                          "🌾 Celiaquía",
                        ].includes(a)
                    ),
                  ].map((item) => {
                    const isSelected = allergies.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => {
                          if (isSelected) {
                            setAllergies(allergies.filter((x) => x !== item));
                          } else {
                            setAllergies([...allergies, item]);
                          }
                        }}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        <span>{item}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setShowCustomAllergyModal(true)}
                    className="px-3.5 py-2 rounded-full text-xs font-semibold border border-dashed border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Escribir otra opción</span>
                  </button>
                </div>

                <div className="text-center text-xs text-zinc-500 font-mono">
                  {allergies.length} exclusiones guardadas
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 15. HÁBITOS Y ESTILO DE VIDA (NUBE DE 18+ ITEMS) */}
            {/* ========================================================================= */}
            {currentStep === 15 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    Cuéntanos un poco sobre tus hábitos y estilo de vida
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Esto nos ayuda a adaptar tu plan a tu rutina real
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto my-auto py-2">
                  {[
                    "🍽️ Como fuera de casa",
                    "🍬 Antojos dulces",
                    "🍿 Pico entre comidas",
                    "💧 Poca agua",
                    "😴 Duermo menos de 7 h",
                    "💻 Trabajo sentado",
                    "😓 Estrés y comida",
                    "🛵 Delivery frecuente",
                    "⚡ Como rápido",
                    "🌙 Ceno tarde",
                    "👨‍🍳 Cocino poco",
                    "📋 Planifico poco",
                    "⏭️ Me salteo comidas",
                    "🥩 Poca proteína",
                    "🪑 Poca actividad",
                    "🍷 Alcohol semanal",
                    "☕ Tomo mucha cafeína",
                    "📱 Uso pantallas de noche",
                  ].map((habit) => {
                    const isSelected = habits.includes(habit);
                    return (
                      <button
                        key={habit}
                        onClick={() => {
                          if (isSelected) {
                            setHabits(habits.filter((x) => x !== habit));
                          } else {
                            setHabits([...habits, habit]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        <span>{habit}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>

                <div className="text-center mt-2">
                  <button
                    onClick={() => setShowMemoryModal(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4"
                  >
                    + Agregar una nota libre sobre ti
                  </button>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 16. INTERLUDIO PEDAGÓGICO: MOCKUP DE SMARTPHONE ("EL COACH ESTÁ ESCRIBIENDO") */}
            {/* ========================================================================= */}
            {currentStep === 16 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                {/* FRAME DE TELÉFONO SIMULADO */}
                <div className="relative max-w-xs mx-auto w-full aspect-[9/12] rounded-[36px] bg-zinc-900 border-4 border-zinc-800 shadow-2xl overflow-hidden flex flex-col justify-end p-4 mb-4">
                  {/* DYNAMIC ISLAND / NOTCH */}
                  <div className="absolute top-3 inset-x-0 mx-auto w-24 h-5 bg-black rounded-full" />

                  {/* BURBUJA DE CHAT ANIMADA */}
                  <div className="bg-zinc-800/90 border border-zinc-700/60 rounded-2xl p-3.5 mb-2 flex items-center justify-between shadow-lg">
                    <span className="text-xs text-zinc-300 font-medium">
                      El coach está escribiendo...
                    </span>
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center mt-2 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                    Vital Fit entiende tu estilo de vida y objetivos
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    Tu coach conecta tus datos de salud, historial de comidas, actividad, hábitos y
                    suplementos para encontrar patrones y ayudarte a alcanzar tus metas.
                  </p>
                </div>

                <div className="mt-auto pt-2">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 17. PAÍS DE RESIDENCIA */}
            {/* ========================================================================= */}
            {currentStep === 17 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿En qué país resides actualmente?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Adaptaremos las opciones de alimentos a tu región
                  </p>
                </div>

                <div className="max-w-sm mx-auto w-full mb-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Buscar país..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition-colors"
                    />
                    {countrySearch && (
                      <button
                        type="button"
                        onClick={() => setCountrySearch("")}
                        className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                        aria-label="Limpiar búsqueda"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-sm mx-auto w-full my-auto overflow-y-auto max-h-[340px] pr-1">
                  {filteredCountries.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                      No encontramos coincidencias para &quot;{countrySearch}&quot;. Puedes seleccionar &quot;Otro / Internacional&quot;.
                    </div>
                  ) : (
                    filteredCountries.map((c) => {
                      const isSelected = country === c.name;
                      return (
                        <div
                          key={c.name}
                          onClick={() => {
                            setCountry(c.name);
                            setTimeout(nextStep, 180);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                            isSelected
                              ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40 shadow-sm shadow-blue-500/10"
                              : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-5 rounded overflow-hidden shadow-sm border border-zinc-700/60 bg-zinc-800 flex items-center justify-center shrink-0">
                              {c.code === "un" ? (
                                <Globe className="w-3.5 h-3.5 text-blue-400" />
                              ) : (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={`https://flagcdn.com/w80/${c.code}.png`}
                                  srcSet={`https://flagcdn.com/w160/${c.code}.png 2x`}
                                  alt={c.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              )}
                            </div>
                            <span className="text-sm font-semibold text-zinc-200">{c.name}</span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 18. AYUNO INTERMITENTE */}
            {/* ========================================================================= */}
            {currentStep === 18 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Realizas ayuno intermitente?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Si realizas ayuno intermitente, cuéntanos de cuántas horas
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-w-sm mx-auto w-full">
                  {[
                    "No",
                    "Sí, 12 horas (12:12)",
                    "Sí, 14 horas (14:10)",
                    "Sí, 16 horas (16:8)",
                    "Sí, 18 horas (18:6)",
                    "Sí, 20 horas (20:4)",
                    "OMAD (una comida al día)",
                  ].map((f) => {
                    const isSelected = fasting === f;
                    return (
                      <div
                        key={f}
                        onClick={() => {
                          setFasting(f);
                          setTimeout(nextStep, 150);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <span className="text-sm font-semibold text-zinc-200">{f}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 19. SUPLEMENTOS */}
            {/* ========================================================================= */}
            {currentStep === 19 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-4 mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    ¿Usas suplementos?
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Selecciona la opción que mejor te represente, podrás ajustarlo más adelante
                  </p>
                </div>

                <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                  {[
                    { val: true, label: "Sí, consumo suplementos" },
                    { val: false, label: "No tomo suplementos" },
                  ].map((s) => {
                    const isSelected = supplements === s.val;
                    return (
                      <div
                        key={String(s.val)}
                        onClick={() => {
                          setSupplements(s.val);
                          setTimeout(nextStep, 150);
                        }}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/40"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <span className="text-base font-bold text-white">{s.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 20. SALUD CLÍNICA Y ARTICULAR */}
            {/* ========================================================================= */}
            {currentStep === 20 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    Cuéntanos sobre tu salud y articulaciones
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Selecciona si tienes alguna molestia o condición para prevenir lesiones
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-w-md mx-auto w-full my-auto overflow-y-auto max-h-72 pr-1">
                  {[
                    { id: "none", label: "🛡️ Sin molestias ni condiciones" },
                    { id: "shoulders", label: "🦴 Molestias en Hombros / Manguito rotador" },
                    { id: "lumbar", label: "⚡ Molestias en Zona Lumbar / Espalda baja" },
                    { id: "knees", label: "🦵 Molestias en Rodillas" },
                    { id: "cervical", label: "💆 Molestias en Cuello / Cervicales" },
                    { id: "wrists", label: "✋ Molestias en Muñecas" },
                    { id: "hipertension", label: "🩺 Hipertensión arterial" },
                    { id: "resistencia_insulina", label: "🩸 Resistencia a la insulina / Diabetes" },
                    { id: "colesterol", label: "🧬 Colesterol o triglicéridos elevados" },
                    { id: "tiroides", label: "🦋 Hipotiroidismo / Tiroides" },
                    ...medicalConditions
                      .filter(
                        (c) =>
                          ![
                            "none",
                            "shoulders",
                            "lumbar",
                            "knees",
                            "cervical",
                            "wrists",
                            "hipertension",
                            "resistencia_insulina",
                            "colesterol",
                            "tiroides",
                          ].includes(c)
                      )
                      .map((c) => ({ id: c, label: `🩺 ${c}` })),
                  ].map((cond) => {
                    const isSelected =
                      jointDiscomfort.includes(cond.id) || medicalConditions.includes(cond.id);
                    return (
                      <div
                        key={cond.id}
                        onClick={() => {
                          if (cond.id === "none") {
                            setJointDiscomfort(["none"]);
                            setMedicalConditions(["none"]);
                          } else {
                            const newJoints = jointDiscomfort.filter((x) => x !== "none");
                            const newMed = medicalConditions.filter((x) => x !== "none");
                            if (isSelected) {
                              setJointDiscomfort(newJoints.filter((x) => x !== cond.id));
                              setMedicalConditions(newMed.filter((x) => x !== cond.id));
                            } else {
                              setJointDiscomfort([...newJoints, cond.id]);
                              setMedicalConditions([...newMed, cond.id]);
                            }
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <span className="text-xs font-semibold text-zinc-200">{cond.label}</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setShowCustomConditionModal(true)}
                    className="p-2.5 rounded-xl border border-dashed border-zinc-700 text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Añadir otra patología o lesión</span>
                  </button>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 21. CALORÍAS DIARIAS RECOMENDADAS (HERO STEPPER TIPO PULSO) */}
            {/* ========================================================================= */}
            {currentStep === 21 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    Calorías diarias recomendadas
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Te recomendamos esta cantidad de calorías en base a tus objetivos
                  </p>
                </div>

                <div className="text-center my-auto py-6">
                  <span className="text-xs font-mono uppercase text-zinc-500 font-semibold">
                    Calorías recomendadas
                  </span>

                  {/* HERO STEPPER [-] 2874 kcal [+] */}
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <button
                      onClick={() => {
                        setCustomCalories((c) => Math.max(1200, c - 50));
                        setShowCalorieWarningModal(true);
                      }}
                      className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-6xl sm:text-7xl font-black text-blue-500 tracking-tight">
                        {customCalories}
                      </span>
                      <span className="text-2xl font-bold text-zinc-400">kcal</span>
                    </div>

                    <button
                      onClick={() => {
                        setCustomCalories((c) => Math.min(5000, c + 50));
                        setShowCalorieWarningModal(true);
                      }}
                      className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* AVISO PEDAGÓGICO DE RIGOR Y ENTRENADOR */}
                  <div className="max-w-sm mx-auto mt-8 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-left">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      La recomendación de calorías se calcula en base a tu información personal y
                      tiene en cuenta el enfoque metabólico y la evidencia científica.{" "}
                      <strong className="text-white font-semibold">
                        Esto puede cambiar dependiendo de lo que te indique tu entrenador y sea
                        mejor para ti.
                      </strong>
                    </p>

                    <button
                      onClick={() => setShowEvidenceModal(true)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ver evidencia científica</span>
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 22. DISTRIBUCIÓN DE MACRONUTRIENTES (ANILLOS CIRCULARES / DONUT RINGS) */}
            {/* ========================================================================= */}
            {currentStep === 22 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-1 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
                    ¿Cómo deseas distribuir tus macronutrientes?
                  </h1>
                </div>

                {/* 3 ANILLOS DONUT VISUALES */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto w-full my-2">
                  {/* PROTEÍNAS */}
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-xs text-purple-400 font-semibold flex items-center gap-1 mb-1">
                      <span>🟣</span> Proteínas
                    </span>
                    <span className="text-2xl font-black text-white">
                      {macroPercentages.protein}%
                    </span>
                    <span className="text-xs font-mono text-zinc-400 mt-0.5">
                      {calculatedMacros.proteinGrams}g
                    </span>
                  </div>

                  {/* GRASAS */}
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 mb-1">
                      <span>🟠</span> Grasas
                    </span>
                    <span className="text-2xl font-black text-white">{macroPercentages.fats}%</span>
                    <span className="text-xs font-mono text-zinc-400 mt-0.5">
                      {calculatedMacros.fatsGrams}g
                    </span>
                  </div>

                  {/* CARBOHIDRATOS */}
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                      <span>🟢</span> Carbos
                    </span>
                    <span className="text-2xl font-black text-white">
                      {macroPercentages.carbs}%
                    </span>
                    <span className="text-xs font-mono text-zinc-400 mt-0.5">
                      {calculatedMacros.carbsGrams}g
                    </span>
                  </div>
                </div>

                {/* PRESETS DE DISTRIBUCIÓN */}
                <div className="flex flex-col gap-2 max-w-sm mx-auto w-full my-2">
                  {[
                    { id: "balanceada", title: "Balanceada", badge: "RECOMENDADA" },
                    { id: "mediterranea", title: "Mediterránea", badge: null },
                    { id: "baja_grasas", title: "Baja en grasas", badge: null },
                    { id: "baja_carbos", title: "Baja en carbohidratos", badge: null },
                    { id: "keto", title: "Keto", badge: null },
                  ].map((p) => {
                    const isSelected = macroPreset === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() =>
                          handleSelectMacroPreset(
                            p.id as
                              | "balanceada"
                              | "mediterranea"
                              | "baja_grasas"
                              | "baja_carbos"
                              | "keto",
                          )
                        }
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-200">{p.title}</span>
                          {p.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-2">
                  <button
                    onClick={() => setShowMacroModal(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center gap-1.5 mx-auto py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Ajustar de forma manual / Asistente coach</span>
                  </button>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 23. MENTALIDAD: HORA DE ROMPER LA RACHA */}
            {/* ========================================================================= */}
            {currentStep === 23 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center mt-2 mb-6">
                  <div className="flex items-center justify-center gap-3 text-4xl mb-3">
                    <span className="opacity-40">🔥</span>
                    <span className="relative">
                      🔥
                      <span className="absolute inset-0 text-red-500 font-black flex items-center justify-center text-3xl">
                        ✕
                      </span>
                    </span>
                    <span className="opacity-40">🔥</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    Hora de romper la racha
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Las rachas artificiales presionan, pero no construyen hábitos sostenibles
                  </p>
                </div>

                <div className="flex flex-col gap-3 max-w-md mx-auto w-full my-auto">
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Vital Fit mide consistencia, no perfección
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        Miramos el patrón de tus últimas semanas. Un mal día nunca te vuelve a cero.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Un día fallido no debería hacerte abandonar
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        Las rachas rígidas hacen sentir un tropiezo como si se perdiera todo el
                        progreso.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Saltar un día no rompe un hábito</h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        Lo que verdaderamente importa es retomar la sesión siguiente con energía.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 24. PERMISO DE NOTIFICACIONES */}
            {/* ========================================================================= */}
            {currentStep === 24 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                {/* MOCKUP DE NOTIFICACIÓN PUSH FLOTANTE */}
                <div className="max-w-sm mx-auto w-full mt-4 mb-8">
                  <div className="p-4 rounded-2xl bg-zinc-800/90 border border-zinc-700/80 shadow-2xl flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      VF
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="font-semibold text-white">☕ Es momento de desayunar</span>
                        <span>ahora</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        El desayuno es clave para mantenerte en equilibrio hoy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center my-auto">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    No te pierdas las recomendaciones de tu coach
                  </h1>
                  <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                    Tu coach y la IA de Vital Fit te avisan oportunamente cuando hay una directriz
                    importante sobre tu nutrición y descanso.
                  </p>
                </div>

                <div className="mt-auto pt-8 flex flex-col gap-3">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/20"
                  >
                    Permitir notificaciones
                  </button>
                  <button
                    onClick={nextStep}
                    className="w-full py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-sm font-semibold transition-colors"
                  >
                    Tal vez después
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 25. ANIMACIÓN DE EMBUDO / CONVERGENCIA EN CARPETA (SIGNATURE ANIMATION) */}
            {/* ========================================================================= */}
            {currentStep === 25 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                {/* TARJETAS FLOTANTES CONVERGIENDO AL ICONO CENTRAL */}
                <div className="relative h-64 max-w-xs mx-auto w-full flex items-center justify-center my-auto">
                  {/* ICONO DE DOCUMENTO / ARCHIVO AZUL CENTRAL */}
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="w-24 h-28 rounded-2xl bg-blue-600 flex flex-col items-center justify-center shadow-2xl shadow-blue-600/40 z-10"
                  >
                    <FileText className="w-12 h-12 text-white" />
                  </motion.div>

                  {/* TARJETAS FLOTANTES EN ÓRBITA CONVERGENTE */}
                  <motion.div
                    animate={{ y: [-8, 8, -8], x: [-6, 6, -6] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    className="absolute -top-2 -left-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-xs font-semibold text-white shadow-lg flex items-center gap-1"
                  >
                    <span>🥩 Proteína {calculatedMacros.proteinGrams}g</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [8, -8, 8], x: [6, -6, 6] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -top-4 -right-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-xs font-semibold text-white shadow-lg flex items-center gap-1"
                  >
                    <span>🚶 Pasos diarios</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [-6, 6, -6], x: [8, -8, 8] }}
                    transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                    className="absolute bottom-2 -left-4 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-xs font-semibold text-white shadow-lg flex items-center gap-1"
                  >
                    <span>🏋️ {sessionDuration} min sesión</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [6, -6, 6], x: [-6, 6, -6] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                    className="absolute -bottom-2 -right-4 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-xs font-semibold text-white shadow-lg flex items-center gap-1"
                  >
                    <span>🔥 {customCalories} kcal</span>
                  </motion.div>
                </div>

                <div className="text-center mt-2 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    Todo listo. Vamos a crear tu plan personalizado.
                  </h1>
                  <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                    El Director Clínico IA y tu entrenador compilarán tus biométricos y hábitos en
                    tu pauta personalizada.
                  </p>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={handleGeneratePlan}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/30 text-base"
                  >
                    Generar mi plan
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 26. SECUENCIA DE CÁLCULO IA (5 ICONOS EN FILA TIPO TICKER) */}
            {/* ========================================================================= */}
            {currentStep === 26 && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                {/* 5 ICONOS CLÍNICOS EN FILA */}
                <div className="flex items-center gap-4 mb-8">
                  {[
                    { icon: Target, label: "Objetivos" },
                    { icon: Heart, label: "Biometría" },
                    { icon: ClipboardList, label: "Recomendaciones" },
                    { icon: SlidersHorizontal, label: "Metabolismo" },
                    { icon: Wand2, label: "Plan" },
                  ].map((ic, index) => {
                    const isPassed = index <= loadingStepIndex;
                    const isCurrent = index === loadingStepIndex;
                    return (
                      <div key={ic.label} className="flex flex-col items-center">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                            isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110"
                              : isPassed
                              ? "bg-blue-900/60 text-blue-300"
                              : "bg-zinc-900 text-zinc-600"
                          }`}
                        >
                          <ic.icon className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-base font-bold text-white">
                    {loadingStepIndex === 0 && "Revisando tus objetivos..."}
                    {loadingStepIndex === 1 && "Calculando gasto basal (Mifflin-St Jeor)..."}
                    {loadingStepIndex === 2 && "Organizando tus recomendaciones y NEAT..."}
                    {loadingStepIndex === 3 && "Modulando balance metabólico y cortisol..."}
                    {loadingStepIndex >= 4 && "Compilando tu arquitectura biológica..."}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 font-mono">
                  Director Clínico IA personalizando directrices biomédicas
                </p>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 27. PANTALLA FINAL DE RESUMEN Y ENTREGA DEL PLAN ("TU PLAN YA ESTÁ LISTO") */}
            {/* ========================================================================= */}
            {currentStep === 27 && (
              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="text-center mt-2 mb-4">
                  {/* ILUSTRACIÓN DEL PLAN */}
                  <div className="w-16 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30 mx-auto mb-3">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    ¡Tu plan ya está listo, {name || user?.name || "Atleta"}!
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
                    La IA de Vital Fit y tu entrenador conectaron tus hábitos, comidas y métricas
                    para generar tu pauta personalizada.
                  </p>
                </div>

                {/* SCROLLABLE SUMMARY CONTENT */}
                <div className="flex-1 overflow-y-auto max-h-[58vh] pr-1 space-y-4">
                  {/* TARJETA 1: DESCRIPCIÓN DEL PLAN Y METAS */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                      <FileText className="w-4 h-4" />
                      <span>Descripción del plan</span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                      {resultData?.clinicalSummary?.justification ||
                        "Plan de optimización metabólica y composición corporal enfocado en preservar masa muscular y modular gasto calórico."}
                    </p>

                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase">
                        Meta diaria de nutrición:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
                          🔥 {resultData?.metrics?.targetCalories || customCalories} calorías
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
                          ↔️ {resultData?.metrics?.targetProtein || calculatedMacros.proteinGrams}g
                          proteínas
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                          💧 {resultData?.metrics?.targetFats || calculatedMacros.fatsGrams}g grasas
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          🥣 {resultData?.metrics?.targetCarbs || calculatedMacros.carbsGrams}g
                          carbos
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
                      <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase">
                        Meta de actividad:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                        <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                          🚶 <strong>8.500 pasos</strong> diarios
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                          🏋️ <strong>{strengthFrequency}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TARJETA 2: ACORDEÓN "MIS OBJETIVOS" */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <button
                      onClick={() => setObjectivesOpen(!objectivesOpen)}
                      className="w-full flex items-center justify-between text-left text-sm font-bold text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>Focos y Objetivos Clínicos</span>
                      </div>
                      {objectivesOpen ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>

                    {objectivesOpen && (
                      <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2">
                        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                            <Scale className="w-4 h-4 text-blue-400" />
                            <span>Cumple tu rango diario de calorías con regularidad</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                            <Droplets className="w-4 h-4 text-cyan-400" />
                            <span>
                              {resultData?.clinicalSummary?.recommendedWaterGlasses || 10} vasos de
                              agua para optimizar el rendimiento celular
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span>Avanza hacia 150 min de actividad cardiovascular semanal</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BANNER INFORMATIVO */}
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-zinc-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>
                      Tu entrenador supervisará y podrá ajustar este plan en cualquier momento
                      conforme avances.
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    onClick={handleFinishAndEnter}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-600/30 text-base flex items-center justify-center gap-2"
                  >
                    <span>Comenzar en Vital Fit</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR MEMORIA LIBRE */}
      {/* ========================================================================= */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowMemoryModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-white">Agregar memoria</h3>
              <button
                onClick={() => {
                  if (newMemoryText.trim()) {
                    setCustomMemories([...customMemories, newMemoryText.trim()]);
                    setNewMemoryText("");
                    setShowMemoryModal(false);
                  }
                }}
                disabled={!newMemoryText.trim()}
                className="w-7 h-7 rounded-full bg-blue-600 disabled:opacity-40 flex items-center justify-center text-white"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              placeholder="Escribe una memoria... ej: 'Entreno en ayunas los sábados', 'Uso la Thermomix para cocinar'..."
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EVIDENCIA CIENTÍFICA SOBRE LAS CALORÍAS */}
      {/* ========================================================================= */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  VF
                </div>
                <span className="text-xs font-bold text-zinc-300">Director Clínico IA</span>
              </div>
              <div className="w-5" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Sobre las calorías</h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Para acompañar tu objetivo de recomposición corporal, calculamos esta recomendación
              adaptada a tu perfil usando la fórmula estándar de oro <strong>Mifflin-St Jeor</strong>
              . Esta cantidad busca modular el balance calórico cuidando tu energía y preservando tu
              masa muscular magra.
            </p>

            <h3 className="text-sm font-bold text-white mb-2">Fuentes de referencia clínica</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Tu ingesta sugerida se basa en evidencia científica y protocolos de nutrición
              deportiva. Estos son algunos de los estudios de referencia:
            </p>

            <div className="space-y-2.5 text-xs text-zinc-400 border-l-2 border-blue-500 pl-3">
              <div>
                <strong className="text-zinc-200 block">
                  Preserving Healthy Muscle during Weight Loss
                </strong>
                <span>Journal of Clinical Endocrinology & Metabolism</span>
              </div>
              <div>
                <strong className="text-zinc-200 block">
                  A new predictive equation for resting energy expenditure in healthy individuals
                </strong>
                <span>Mifflin MD, St Jeor ST, et al. Am J Clin Nutr</span>
              </div>
            </div>

            <button
              onClick={() => setShowEvidenceModal(false)}
              className="mt-6 w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADVERTENCIA AJUSTE MANUAL DE CALORÍAS */}
      {/* ========================================================================= */}
      {showCalorieWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Ajuste manual de calorías</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Al ajustar tus calorías manualmente, reemplazarás la recomendación personalizada de
              Vital Fit. Recomendamos hacerlo solo si cuentas con una indicación específica de tu
              entrenador o profesional de la salud.
            </p>
            <button
              onClick={() => setShowCalorieWarningModal(false)}
              className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MODIFICAR VALORES DE MACROS (ASISTENTE IA PARA ATLETA / COACH) */}
      {/* ========================================================================= */}
      {showMacroModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowMacroModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-white">Modificar valores nutricionales</h3>
              <button
                onClick={() => setShowMacroModal(false)}
                className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>

            {/* TOGGLE GRAMOS / PORCENTAJES */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                <button
                  onClick={() => setManualMacroUnit("percentage")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    manualMacroUnit === "percentage" ? "bg-blue-600 text-white" : "text-zinc-400"
                  }`}
                >
                  Porcentaje
                </button>
                <button
                  onClick={() => setManualMacroUnit("grams")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    manualMacroUnit === "grams" ? "bg-blue-600 text-white" : "text-zinc-400"
                  }`}
                >
                  Gramos
                </button>
              </div>
            </div>

            {/* BALANCE ACTUAL */}
            <div className="text-center mb-4">
              <span
                className={`text-xs font-mono font-bold ${
                  macroPercentages.protein + macroPercentages.fats + macroPercentages.carbs === 100
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {100 -
                  (macroPercentages.protein + macroPercentages.fats + macroPercentages.carbs)}
                % pendiente de distribuir
              </span>
            </div>

            {/* STEPPERS POR MACRO */}
            <div className="space-y-3">
              {/* PROTEÍNAS */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🟣</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Proteínas</h4>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {calculatedMacros.proteinGrams}g
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setMacroPercentages((p) => ({
                        ...p,
                        protein: Math.max(10, p.protein - 5),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">
                    {macroPercentages.protein}%
                  </span>
                  <button
                    onClick={() =>
                      setMacroPercentages((p) => ({
                        ...p,
                        protein: Math.min(60, p.protein + 5),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* GRASAS */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🟠</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Grasas</h4>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {calculatedMacros.fatsGrams}g
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setMacroPercentages((p) => ({
                        ...p,
                        fats: Math.max(10, p.fats - 5),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">
                    {macroPercentages.fats}%
                  </span>
                  <button
                    onClick={() =>
                      setMacroPercentages((p) => ({
                        ...p,
                        fats: Math.min(60, p.fats + 5),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARBOHIDRATOS */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🟢</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Carbohidratos</h4>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {calculatedMacros.carbsGrams}g
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setMacroPercentages((p) => ({
                        ...p,
                        carbs: Math.max(10, p.carbs - 5),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">
                    {macroPercentages.carbs}%
                  </span>
                  <button
                    onClick={() =>
                      setMacroPercentages((p) => ({
                        ...p,
                        carbs: Math.min(70, p.carbs + 5),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 text-center mt-4 leading-relaxed">
              Cada macronutriente debe aportar entre 15% y 50% de tus calorías para una
              distribución equilibrada.
            </p>

            <button
              onClick={() => setShowMacroModal(false)}
              className="mt-6 w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              Confirmar distribución
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PORCENTAJE DE GRASA EXACTO */}
      {/* ========================================================================= */}
      {showExactFatModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-xs w-full shadow-2xl text-center">
            <h3 className="text-sm font-bold text-white mb-2">Porcentaje de grasa exacto</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Si conoces tu valor de InBody o DEXA, ingrésalo aquí:
            </p>
            <div className="flex items-center justify-center gap-1 mb-6">
              <input
                type="number"
                min={3}
                max={60}
                step={0.1}
                value={exactFatInput}
                onChange={(e) => setExactFatInput(e.target.value)}
                placeholder="16.5"
                className="w-24 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-xl font-black text-white outline-none focus:border-blue-500"
              />
              <span className="text-lg font-bold text-zinc-400">%</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExactFatModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (exactFatInput.trim()) {
                    setBodyFat(`${exactFatInput.trim()}%`);
                    setShowExactFatModal(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AÑADIR OTRA CONDICIÓN O PATOLOGÍA */}
      {/* ========================================================================= */}
      {showCustomConditionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Añadir otra condición</h3>
              <button
                onClick={() => setShowCustomConditionModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={customConditionText}
              onChange={(e) => setCustomConditionText(e.target.value)}
              placeholder="Ej: Hernia discal L5-S1, Artritis..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 mb-4"
            />
            <button
              onClick={() => {
                if (customConditionText.trim()) {
                  setMedicalConditions([
                    ...medicalConditions.filter((x) => x !== "none"),
                    customConditionText.trim(),
                  ]);
                  setCustomConditionText("");
                  setShowCustomConditionModal(false);
                }
              }}
              disabled={!customConditionText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-40 text-xs font-bold text-white"
            >
              Agregar condición
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AÑADIR OTRA PREFERENCIA ALIMENTARIA */}
      {/* ========================================================================= */}
      {showCustomFoodPrefModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Otra preferencia alimentaria</h3>
              <button
                onClick={() => setShowCustomFoodPrefModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={customFoodPrefText}
              onChange={(e) => setCustomFoodPrefText(e.target.value)}
              placeholder="Ej: Kosher, Halal, Dieta alcalina..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 mb-4"
            />
            <button
              onClick={() => {
                if (customFoodPrefText.trim()) {
                  setFoodPreferences([...foodPreferences, customFoodPrefText.trim()]);
                  setCustomFoodPrefText("");
                  setShowCustomFoodPrefModal(false);
                }
              }}
              disabled={!customFoodPrefText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-40 text-xs font-bold text-white"
            >
              Agregar preferencia
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AÑADIR OTRA ALERGIA O INTOLERANCIA */}
      {/* ========================================================================= */}
      {showCustomAllergyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Otra alergia o intolerancia</h3>
              <button
                onClick={() => setShowCustomAllergyModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={customAllergyText}
              onChange={(e) => setCustomAllergyText(e.target.value)}
              placeholder="Ej: Fructosa, Sulfito, Acaros..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 mb-4"
            />
            <button
              onClick={() => {
                if (customAllergyText.trim()) {
                  setAllergies([...allergies, customAllergyText.trim()]);
                  setCustomAllergyText("");
                  setShowCustomAllergyModal(false);
                }
              }}
              disabled={!customAllergyText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-40 text-xs font-bold text-white"
            >
              Agregar exclusión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
