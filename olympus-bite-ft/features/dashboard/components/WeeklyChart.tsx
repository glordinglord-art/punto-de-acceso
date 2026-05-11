"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardTitle } from "@/shared/components/ui/Card";
import { getLocalDateString } from "@/shared/lib/utils";
import type { WeeklyTrendDay } from "../types/dashboard.types";

interface WeeklyChartProps {
  data: WeeklyTrendDay[];
}

const CHART_H = 130;
const GRID_LINES = 4;

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxMeals = useMemo(() => Math.max(...data.map((d) => d.meals), 1), [data]);
  const maxCalories = useMemo(() => Math.max(...data.map((d) => d.calories), 1), [data]);
  const totalMeals = useMemo(() => data.reduce((s, d) => s + d.meals, 0), [data]);
  const totalCalories = useMemo(() => data.reduce((s, d) => s + d.calories, 0), [data]);

  const today = getLocalDateString();

  if (!data.length) {
    return (
      <Card className="flex h-full flex-col">
        <CardTitle className="mb-4">Actividad semanal</CardTitle>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-400">Sin datos esta semana</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <CardTitle>Actividad semanal</CardTitle>
          <div className="mt-2 flex gap-5">
            <div>
              <p className="font-display text-3xl font-bold leading-none text-white">{totalMeals}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">comidas totales</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold leading-none text-white">
                {totalCalories.toLocaleString('es')}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">kcal totales</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Comidas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary-400" />
            Calorías
          </span>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative mt-1 flex-1" style={{ height: CHART_H + 36 }}>
        {/* Grid lines */}
        {Array.from({ length: GRID_LINES }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-dashed border-white/6"
            style={{ bottom: 32 + ((i + 1) / GRID_LINES) * CHART_H }}
          />
        ))}

        {/* Baseline */}
        <div className="absolute left-0 right-0 border-t border-white/12" style={{ bottom: 32 }} />

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-0.5 pb-8">
          {data.map((d, idx) => {
            const isToday = d.date === today;
            const mealsH = d.meals > 0 ? Math.max((d.meals / maxMeals) * CHART_H, 8) : 0;
            const calsH = d.calories > 0 ? Math.max((d.calories / maxCalories) * CHART_H, 8) : 0;
            const hasData = d.meals > 0 || d.calories > 0;

            return (
              <div
                key={d.date}
                className="relative flex flex-1 flex-col items-center"
                style={{ height: CHART_H }}
              >
                {/* Count badge */}
                {d.meals > 0 && (
                  <motion.span
                    className="absolute text-[10px] font-bold text-slate-400"
                    style={{ bottom: Math.max(mealsH, calsH) + 6 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + idx * 0.08 }}
                  >
                    {d.meals}
                  </motion.span>
                )}

                {/* Bar pair */}
                <div className="absolute bottom-0 left-0.5 right-0.5 flex items-end gap-[2px]">
                  {!hasData ? (
                    <>
                      <div className="flex-1 rounded-t-md bg-white/8" style={{ height: CHART_H * 0.05 }} />
                      <div className="flex-1 rounded-t-md bg-white/5" style={{ height: CHART_H * 0.03 }} />
                    </>
                  ) : (
                    <>
                      {/* Meals bar */}
                      <motion.div
                        className={`flex-1 rounded-t-md ${
                          isToday
                            ? 'bg-linear-to-t from-blue-600 to-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                            : 'bg-linear-to-t from-blue-700/70 to-blue-500/50'
                        }`}
                        style={{ transformOrigin: 'bottom' }}
                        initial={{ scaleY: 0, height: mealsH || CHART_H * 0.04 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.7, delay: idx * 0.08, ease: 'easeOut' }}
                      />
                      {/* Calories bar */}
                      <motion.div
                        className={`flex-1 rounded-t-md ${
                          isToday
                            ? 'bg-linear-to-t from-primary-600 to-primary-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                            : 'bg-linear-to-t from-primary-700/60 to-primary-500/40'
                        }`}
                        style={{ transformOrigin: 'bottom' }}
                        initial={{ scaleY: 0, height: calsH || CHART_H * 0.04 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.7, delay: 0.04 + idx * 0.08, ease: 'easeOut' }}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day labels */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {data.map((d) => {
            const isToday = d.date === today;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center">
                <span
                  className={`text-[11px] font-medium ${
                    isToday ? 'font-bold text-blue-300' : 'text-slate-500'
                  }`}
                >
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
