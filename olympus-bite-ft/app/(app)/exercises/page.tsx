import { ExerciseDictionaryList } from "@/features/routines/components/ExerciseDictionaryList";

export default function ExercisesPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            Diccionario de Ejercicios
          </h1>
          <p className="text-sm text-neutral-500">
            Gestiona la librería global de ejercicios disponibles para las
            rutinas.
          </p>
        </div>
      </div>

      <ExerciseDictionaryList />
    </div>
  );
}
