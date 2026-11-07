"use client";

import { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { SetLogger } from "./SetLogger";
import { RestTimer } from "./RestTimer";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import type { Exercise, SetLogData } from "../types/routines.types";
import {
  exerciseDictionaryService,
  type ExerciseDict,
} from "../services/exercise-dictionary.service";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import { Info, CheckCircle, Sparkles } from "lucide-react";
import type { ExerciseAutoregulationInsight } from "../utils/vital-fit-labs-engine";
import { useAuth } from "@/features/auth/hooks/useAuth";

function cleanCoachNotes(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim();
  while (
    (s.startsWith("[") && s.endsWith("]")) ||
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) {
          s = String(parsed[0]);
          continue;
        }
      } catch {
        // fallback
      }
      s = s.slice(1, -1).trim();
    } else {
      s = s.slice(1, -1).trim();
    }
  }
  return s.trim() || null;
}

export function ExerciseCard({
  exercise,
  activeSetIndex,
  completedSetCount,
  loggedSets,
  restRemaining,
  isSaving,
  onSetComplete,
  onSelectSet,
  onSkipSet,
  onRestFinish,
  onRestSkip,
  dictEntry,
  insight,
}: {
  exercise: Exercise;
  activeSetIndex: number;
  completedSetCount: number;
  loggedSets: SetLogData[];
  restRemaining: number;
  isSaving: boolean;
  onSetComplete: (
    setIndex: number,
    weight: number | null,
    reps: number | null,
  ) => void;
  onSelectSet: (setIndex: number) => void;
  onSkipSet?: () => void;
  onRestFinish: () => void;
  onRestSkip: () => void;
  dictEntry?: ExerciseDict | null;
  insight?: ExerciseAutoregulationInsight | null;
}) {
  const { user } = useAuth();
  const userUnit = (
    user?.weightUnitPreference === "lbs" ? "lbs" : "kg"
  ) as "kg" | "lbs";

  const isResting = restRemaining > 0;
  const allDone = completedSetCount >= exercise.sets;
  const [showGuide, setShowGuide] = useState(false);
  const [gifLoaded, setGifLoaded] = useState(false);
  const [gifError, setGifError] = useState(false);
  const [showMissionDetails, setShowMissionDetails] = useState(false);
  const [fastDictEntry, setFastDictEntry] = useState<ExerciseDict | null>(null);

  // Fast on-demand dictionary lookup if the full dictionary hasn't resolved yet
  useEffect(() => {

    if (dictEntry?.gifUrl || dictEntry?.imageUrl) return;

    let cancelled = false;
    exerciseDictionaryService
      .search({ q: exercise.name, limit: 3 })
      .then((res) => {
        if (cancelled || !res.data?.length) return;
        const exact =
          res.data.find(
            (d) =>
              d.name.toLowerCase().trim() ===
              exercise.name.toLowerCase().trim(),
          ) || res.data[0];
        if (exact) setFastDictEntry(exact);
      })
      .catch(() => {
        // Ignore network errors
      });

    return () => {
      cancelled = true;
    };
  }, [exercise.id, exercise.name, dictEntry]);

  const resolvedDict = dictEntry ?? fastDictEntry;
  const activeSetLog =
    loggedSets.find((s) => s.set === activeSetIndex + 1) ?? null;

  const primaryMediaUrl = !gifError
    ? resolvedDict?.gifUrl ||
      resolvedDict?.imageUrl ||
      exercise.gifUrl ||
      null
    : resolvedDict?.imageUrl || null;

  const hasGuide =
    !!resolvedDict?.gifUrl ||
    !!resolvedDict?.imageUrl ||
    !!resolvedDict?.instructionsEs ||
    (resolvedDict?.instructionStepsEs &&
      resolvedDict.instructionStepsEs.length > 0);

  const muscleInfo =
    MUSCLE_GROUPS[exercise.muscleGroup as keyof typeof MUSCLE_GROUPS];
  const cleanNotes = cleanCoachNotes(exercise.observations);

  // Shorten verbose badge labels so they never wrap on mobile
  const compactBadgeLabel = (() => {
    if (!insight?.badgeLabel) return "";
    return insight.badgeLabel.replace(/VITAL FIT LABS\s*·\s*/i, "");
  })();

  return (
    <div className="flex flex-col gap-3 px-4 max-w-md mx-auto w-full animate-in fade-in duration-200">
      {/* ── FITIA UNIFIED EXERCISE HERO CARD (#12141a) ── */}
      <div className="rounded-[26px] bg-[#12141a] border border-white/[0.06] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.45)] space-y-3">
        {/* Top Row: Media Frame (Left) + Exercise Meta & Prescription (Right) */}
        <div className="flex items-center gap-3.5">
          {/* 3D / GIF Frame */}
          <div
            onClick={() => hasGuide && setShowGuide(true)}
            className={cn(
              "relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#181b22] border border-white/10 shrink-0 flex items-center justify-center",
              hasGuide && "cursor-pointer hover:border-cyan-400/50 transition",
            )}
          >
            {primaryMediaUrl ? (
              <>
                {!gifLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#181b22]">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryMediaUrl}
                  alt={exercise.name}
                  className={cn(
                    "w-full h-full object-contain bg-white p-1 rounded-xl transition-opacity duration-300",
                    gifLoaded ? "opacity-100" : "opacity-0",
                  )}
                  onLoad={() => setGifLoaded(true)}
                  onError={() => setGifError(true)}
                  loading="eager"
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-2">
                <span className="text-3xl">{muscleInfo?.icon || "🏋️"}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 mt-1">
                  {muscleInfo?.label || exercise.muscleGroup}
                </span>
              </div>
            )}

            {hasGuide && (
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs border border-white/15 text-[9px] font-black text-cyan-300 uppercase">
                3D
              </span>
            )}
          </div>

          {/* Right Info Column */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Muscle & Intensity Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold text-neutral-300">
                {muscleInfo?.icon || "💪"}{" "}
                {muscleInfo?.label || exercise.muscleGroup}
              </span>
              {exercise.intensity === "failure" ? (
                <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-300">
                  🔴 Al Fallo
                </span>
              ) : exercise.intensity === "relax" ? (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                  🟢 Relax
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                  🟡 Media
                </span>
              )}
            </div>

            {/* Exercise Name */}
            <h2 className="text-base sm:text-lg font-display font-black uppercase tracking-tight text-white leading-snug">
              {exercise.name}
            </h2>

            {/* Prescription Pills */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold flex-wrap">
              <span className="px-2 py-0.5 rounded-lg bg-[#090b10] border border-white/[0.08] text-white tabular-nums">
                {exercise.sets} {exercise.sets === 1 ? "Serie" : "Series"}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#090b10] border border-white/[0.08] text-cyan-300 tabular-nums">
                {exercise.reps} Reps
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#090b10] border border-white/[0.08] text-amber-300 tabular-nums">
                {exercise.targetWeight && exercise.targetWeight > 0
                  ? userUnit === "lbs"
                    ? `${Math.round(exercise.targetWeight * 2.20462 * 2) / 2} lbs`
                    : `${exercise.targetWeight} kg`
                  : "Corporal"}
              </span>
            </div>

            {/* Technical Guide Button */}
            {hasGuide && (
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 text-[10px] font-bold text-cyan-300 border border-cyan-500/25 transition cursor-pointer active:scale-95"
              >
                <Info className="w-3 h-3" />
                <span>Ver Guía Técnica 3D</span>
              </button>
            )}
          </div>
        </div>

        {/* Unified Mission & Coach Note Sub-Card */}
        {(insight || cleanNotes) && (
          <div className="rounded-2xl bg-[#090b10] border border-white/[0.06] p-3 space-y-1.5">
            {insight && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Misión de Hoy
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0",
                        insight.tone === "emerald" &&
                          "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                        insight.tone === "cyan" &&
                          "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
                        insight.tone === "amber" &&
                          "bg-amber-500/15 text-amber-300 border-amber-500/30",
                        insight.tone === "rose" &&
                          "bg-rose-500/15 text-rose-300 border-rose-500/30",
                        insight.tone === "slate" &&
                          "bg-white/[0.06] text-neutral-300 border-white/10",
                      )}
                    >
                      {compactBadgeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMissionDetails(!showMissionDetails)}
                      className="text-[10px] font-bold text-neutral-400 hover:text-white px-1.5 py-0.5 rounded bg-white/[0.04] transition cursor-pointer"
                    >
                      {showMissionDetails ? "▲" : "▼ Info"}
                    </button>
                  </div>
                </div>

                <p className="text-xs font-bold text-white leading-snug">
                  {insight.missionText}
                </p>

                {showMissionDetails && (
                  <div className="pt-1.5 border-t border-white/[0.06] space-y-1 text-[11px] text-neutral-400">
                    <p>
                      Historial:{" "}
                      <strong className="text-neutral-200">
                        {insight.historyChainText}
                      </strong>
                    </p>
                    {insight.whyText && <p>{insight.whyText}</p>}
                  </div>
                )}
              </>
            )}

            {cleanNotes && (
              <p
                className={cn(
                  "text-[11px] text-amber-200/90 italic leading-relaxed",
                  insight && "pt-1.5 border-t border-white/[0.05]",
                )}
              >
                💬 &quot;{cleanNotes}&quot;
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── REST TIMER OR SET LOGGER ── */}
      {isResting ? (
        <RestTimer
          duration={exercise.restSeconds}
          remaining={restRemaining}
          onFinish={onRestFinish}
          onSkip={onRestSkip}
        />
      ) : (
        <>
          {allDone && (
            <div className="flex items-center gap-3 py-2.5 px-4 rounded-2xl bg-emerald-500/12 border border-emerald-500/25">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <CheckCircle className="h-5 w-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  ¡Ejercicio completado!
                </p>
                <p className="text-[11px] text-neutral-400 leading-snug">
                  Pasa al siguiente arriba o toca una serie para corregirla.
                </p>
              </div>
            </div>
          )}

          <SetLogger
            setNumber={activeSetIndex + 1}
            totalSets={exercise.sets}
            targetWeight={exercise.targetWeight}
            targetReps={exercise.reps}
            intensity={exercise.intensity}
            loggedWeight={activeSetLog?.weight ?? null}
            loggedReps={activeSetLog?.reps ?? null}
            isLogged={!!activeSetLog?.completed}
            loggedSets={loggedSets}
            onSelectSet={onSelectSet}
            defaultUnit={userUnit}
            previousWeight={
              insight?.previousWeekSets?.[activeSetIndex]?.weight ??
              insight?.previousWeekSets?.[0]?.weight ??
              null
            }
            previousReps={
              insight?.previousWeekSets?.[activeSetIndex]?.reps ??
              insight?.previousWeekSets?.[0]?.reps ??
              null
            }
            insight={insight}
            disabled={isSaving}
            onComplete={(w, r) => onSetComplete(activeSetIndex, w, r)}
            onSkip={onSkipSet}
          />
        </>
      )}

      {resolvedDict && (
        <ExerciseInfoModal
          exercise={resolvedDict}
          isOpen={showGuide}
          onClose={() => setShowGuide(false)}
        />
      )}
    </div>
  );
}
