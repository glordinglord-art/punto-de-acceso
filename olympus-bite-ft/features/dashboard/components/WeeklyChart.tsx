"use client";

import { useMemo } from "react";
import { Card, CardTitle } from "@/shared/components/ui/Card";
import type { WeeklyTrendDay } from "../types/dashboard.types";

interface WeeklyChartProps {
  data: WeeklyTrendDay[];
}

const CHART_H = 120; // px — fixed height for bar area
const GRID_LINES = 4;

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxMeals = useMemo(
    () => Math.max(...data.map((d) => d.meals), 1),
    [data],
  );
  const maxCalories = useMemo(
    () => Math.max(...data.map((d) => d.calories), 1),
    [data],
  );
  const totalMeals = useMemo(
    () => data.reduce((s, d) => s + d.meals, 0),
    [data],
  );
  const totalCalories = useMemo(
    () => data.reduce((s, d) => s + d.calories, 0),
    [data],
  );

  const today = new Date().toISOString().split("T")[0];

  if (!data.length) {
    return (
      <Card className="h-full flex flex-col">
        <CardTitle className="mb-4">Actividad semanal</CardTitle>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-neutral-400">Sin datos esta semana</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <CardTitle>Actividad semanal</CardTitle>
          <div className="flex gap-5 mt-2">
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">
                {totalMeals}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                comidas totales
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">
                {totalCalories.toLocaleString()}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                kcal totales
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400 shrink-0">
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

      {/* ── Chart area ── */}
      <div className="relative mt-2" style={{ height: CHART_H + 32 }}>
        {/* Subtle grid lines */}
        {Array.from({ length: GRID_LINES }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-dashed border-neutral-800/60"
            style={{ bottom: 32 + ((i + 1) / GRID_LINES) * CHART_H }}
          />
        ))}

        {/* Solid baseline */}
        <div
          className="absolute left-0 right-0 border-t border-neutral-700/80"
          style={{ bottom: 32 }}
        />

        {/* Bar columns */}
        <div className="absolute inset-0 flex items-end gap-1 pb-8">
          {data.map((d) => {
            const isToday = d.date === today;
            const mealsH =
              d.meals > 0 ? Math.max((d.meals / maxMeals) * CHART_H, 8) : 0;
            const calsH =
              d.calories > 0
                ? Math.max((d.calories / maxCalories) * CHART_H, 8)
                : 0;
            const hasData = d.meals > 0 || d.calories > 0;

            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center relative"
                style={{ height: CHART_H }}
              >
                {/* Count badge above bars */}
                {d.meals > 0 && (
                  <span
                    className="absolute text-[10px] font-semibold text-neutral-300"
                    style={{ bottom: Math.max(mealsH, calsH) + 4 }}
                  >
                    {d.meals}
                  </span>
                )}

                {/* Bar pair */}
                <div className="absolute bottom-0 left-1 right-1 flex items-end gap-[2px]">
                  {/* Ghost bars (empty day placeholder) */}
                  {!hasData ? (
                    <>
                      <div
                        className="flex-1 rounded-t-md bg-neutral-800/50"
                        style={{ height: CHART_H * 0.06 }}
                      />
                      <div
                        className="flex-1 rounded-t-md bg-neutral-800/30"
                        style={{ height: CHART_H * 0.04 }}
                      />
                    </>
                  ) : (
                    <>
                      {/* Meals bar — blue */}
                      <div
                        className={`flex-1 rounded-t-md transition-all duration-700 ${
                          isToday
                            ? "bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-500/30"
                            : "bg-gradient-to-t from-blue-700/80 to-blue-500/60"
                        }`}
                        style={{ height: mealsH || CHART_H * 0.04 }}
                      />
                      {/* Calories bar — primary color (theme-aware) */}
                      <div
                        className={`flex-1 rounded-t-md transition-all duration-700 ${
                          isToday
                            ? "bg-gradient-to-t from-primary-600 to-primary-400 shadow-lg shadow-primary-500/30"
                            : "bg-gradient-to-t from-primary-700/70 to-primary-500/50"
                        }`}
                        style={{ height: calsH || CHART_H * 0.04 }}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Labels row pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {data.map((d) => {
            const isToday = d.date === today;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center">
                <span
                  className={`text-[11px] font-medium ${
                    isToday ? "text-blue-400 font-bold" : "text-neutral-500"
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
