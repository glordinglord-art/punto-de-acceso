interface StatsOverviewProps {
  totalClients: number;
  activeMealsToday: number;
  totalRoutines: number;
  activeRoutines: number;
  avgCaloriesToday: number;
  mealsThisWeek: number;
  mealsLastWeek: number;
}

export function StatsOverview(props: StatsOverviewProps) {
  const weekDiff = props.mealsLastWeek > 0
    ? Math.round(((props.mealsThisWeek - props.mealsLastWeek) / props.mealsLastWeek) * 100)
    : props.mealsThisWeek > 0 ? 100 : 0;

  const cards = [
    {
      label: 'Clientes activos',
      value: props.totalClients,
      icon: '👥',
      gradient: 'from-blue-600 to-blue-400',
      lightBg: 'bg-blue-50 dark:bg-blue-950/40',
      extra: null,
    },
    {
      label: 'Comidas hoy',
      value: props.activeMealsToday,
      icon: '🍽️',
      gradient: 'from-emerald-600 to-emerald-400',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      extra: weekDiff !== 0 ? `${weekDiff > 0 ? '+' : ''}${weekDiff}% vs sem. pasada` : null,
      extraPositive: weekDiff >= 0,
    },
    {
      label: 'Rutinas activas',
      value: props.activeRoutines,
      icon: '💪',
      gradient: 'from-purple-600 to-purple-400',
      lightBg: 'bg-purple-50 dark:bg-purple-950/40',
      extra: props.totalRoutines > 0 ? `${props.totalRoutines} total creadas` : null,
    },
    {
      label: 'Promedio kcal',
      value: props.avgCaloriesToday,
      icon: '🔥',
      gradient: 'from-amber-500 to-orange-400',
      lightBg: 'bg-amber-50 dark:bg-amber-950/40',
      extra: props.activeMealsToday > 0 ? 'promedio hoy' : 'sin datos hoy',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-2xl min-w-0 ${card.lightBg} border border-neutral-100 dark:border-neutral-800 p-5 transition-all hover:scale-[1.02] hover:shadow-lg`}
        >
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${card.gradient}`} />

          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{card.icon}</span>
          </div>

          <p className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {card.value.toLocaleString()}
          </p>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
            {card.label}
          </p>

          {card.extra && (
            <p className={`text-xs mt-2 font-medium truncate ${
              'extraPositive' in card
                ? card.extraPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
                : 'text-neutral-400'
            }`}>
              {card.extra}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
