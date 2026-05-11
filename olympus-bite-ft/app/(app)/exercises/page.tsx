import { ExerciseDictionaryList } from "@/features/routines/components/ExerciseDictionaryList";
import { Header } from "@/shared/components/layout/Header";

export default function ExercisesPage() {
  return (
    <>
      <Header 
        title="Diccionario de Ejercicios" 
        subtitle="Gestiona la librería global de ejercicios disponibles para las rutinas."
      />
      <div className="max-w-5xl mx-auto pb-12">
        <ExerciseDictionaryList />
      </div>
    </>
  );
}
