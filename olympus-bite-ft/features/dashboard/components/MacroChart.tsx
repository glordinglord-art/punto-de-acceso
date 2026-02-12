import { Card, CardTitle } from '@/shared/components/ui/Card';
import type { MacroAverages, MealTypeCount } from '../types/dashboard.types';
import { MEAL_TYPE_COLORS } from '../types/dashboard.types';

interface MacroChartProps {
  macros: MacroAverages;
  mealTypes: MealTypeCount[];
}

const MACRO_CONFIG = [
  { key: 'protein' as const, label: 'Proteína', unit: 'g', color: 'bg-red-500', lightBg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  { key: 'carbs' as const, label: 'Carbos', unit: 'g', color: 'bg-blue-500', lightBg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  { key: 'fat' as const, label: 'Grasas', unit: 'g', color: 'bg-yellow-500', lightBg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
  { key: 'fiber' as const, label: 'Fibra', unit: 'g', color: 'bg-green-500', lightBg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  { key: 'sugar' as const, label: 'Azúcar', unit: 'g', color: 'bg-pink-500', lightBg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
];

export function MacroChart({ macros, mealTypes }: MacroChartProps) {
  const maxMacro = Math.max(macros.protein, macros.carbs, macros.fat, macros.fiber, macros.sugar, 1);
  const totalMealTypes = mealTypes.reduce((s, m) => s + m.count, 0) || 1;

  return (
    <Card className="h-full">
      <CardTitle>Nutrición promedio hoy</CardTitle>

      {/* Macro bars */}
      <div className="space-y-3 mt-4">
        {MACRO_CONFIG.map((m) => {
          const value = macros[m.key];
          const pct = (value / maxMacro) * 100;
          return (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{m.label}</span>
                <span className={`text-sm font-bold ${m.text}`}>
                  {value}{m.unit}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.color} transition-all duration-500`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Meal type distribution */}
      {mealTypes.length > 0 && (
        <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            Distribución por tipo
          </p>

          {/* Stacked bar */}
          <div className="flex h-4 rounded-full overflow-hidden mb-3">
            {mealTypes.map((mt) => {
              const pct = (mt.count / totalMealTypes) * 100;
              const color = MEAL_TYPE_COLORS[mt.type]?.ring || '#9ca3af';
              return (
                <div
                  key={mt.type}
                  className="transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            {mealTypes.map((mt) => {
              const config = MEAL_TYPE_COLORS[mt.type];
              return (
                <div
                  key={mt.type}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                    config?.bg || 'bg-neutral-100'
                  } ${config?.text || 'text-neutral-600'}`}
                >
                  {mt.type}
                  <span className="font-bold">{mt.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
