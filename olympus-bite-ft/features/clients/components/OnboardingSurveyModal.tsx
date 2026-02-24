import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { FITNESS_GOALS } from "@/features/meals/types/meals.types";
import { clientsService } from "@/features/clients/services/clients.service";
import type { User } from "@/shared/types/common.types";

export function OnboardingSurveyModal() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<string>("");

  // Advanced Profile Filters
  const [experienceLevel, setExperienceLevel] = useState("");
  const [equipmentAccess, setEquipmentAccess] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");

  // Mostrar el modal si hay usuario activo, es cliente, y no completó el onboarding
  const isClient = user?.role === "client";
  const showModal = Boolean(user && isClient && !user.onboardingCompleted);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validaciones básicas
    if (!weight || !height || !goal) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload: any = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        dietaryGoal: goal,
      };

      if (experienceLevel) payload.experienceLevel = experienceLevel;
      if (equipmentAccess) payload.equipmentAccess = equipmentAccess;
      if (medicalConditions) payload.medicalConditions = medicalConditions;
      if (dietaryPreferences) payload.dietaryPreferences = dietaryPreferences;

      const res = await clientsService.completeOnboarding(user.id, payload);

      // Actualizamos el usuario en el contexto
      const updatedUser: User = res.data;

      const authData = {
        user: updatedUser,
        // Al actualizar parcialmente, necesitamos el token que ya estaba,
        // como useAuth guarda authData en localStorage y login lo sobreescribe,
        // necesitamos recrear el objeto completo pero eso no es posible sin el accessToken.
        // Simularemos un recargado en AppLayout
      };

      // La forma más segura en este contexto es actualizar Storage y recargar o actualizar via props
      // Como useAuth exporta 'login', pasaremos todo el payload que espera.
      const currentToken = localStorage.getItem("ob_token") || "";
      login({ user: updatedUser, accessToken: currentToken });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {}} // No permitir cerrar el modal hasta responder
      title="Completa tu perfil"
      size="md"
    >
      <div className="text-center py-2 mb-4">
        <p className="text-neutral-500 dark:text-neutral-400">
          Para personalizar tus rutinas y tu experiencia, necesitamos conocer
          unos pocos datos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            placeholder="Ej: 75.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Estatura (cm)"
            type="number"
            placeholder="Ej: 175"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Objetivo Principal
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(FITNESS_GOALS).map(([key, def]) => (
              <div
                key={key}
                onClick={() => setGoal(key)}
                className={`cursor-pointer rounded-xl border-2 p-3 transition-all flex items-center gap-3 ${
                  goal === key
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-neutral-200 bg-white hover:border-emerald-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-emerald-800"
                }`}
              >
                <div className="text-2xl">{def.icon}</div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                    {def.label}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {def.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- ADVANCED PROFILE FIELDS --- */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Información Avanzada (Opcional)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nivel de Experiencia
              </label>
              <select
                className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="">Selecciona tu nivel...</option>
                <option value="Principiante">Principiante (0-1 año)</option>
                <option value="Intermedio">Intermedio (1-3 años)</option>
                <option value="Avanzado">Avanzado (+3 años)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Equipamiento Disponible
              </label>
              <select
                className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2"
                value={equipmentAccess}
                onChange={(e) => setEquipmentAccess(e.target.value)}
              >
                <option value="">Selecciona equipamiento...</option>
                <option value="Ninguno">Ninguno</option>
                <option value="Gimnasio completo">Gimnasio completo</option>
                <option value="Solo mancuernas/cintas">
                  Solo mancuernas / cintas
                </option>
                <option value="Peso corporal (casa)">
                  Peso corporal (casa)
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Lesiones o Condiciones Médicas"
              type="text"
              placeholder="Ej: Dolor lumbar, hernia discal (opcional)"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
            />
            <Input
              label="Preferencias Alimentarias / Alergias"
              type="text"
              placeholder="Ej: Intolerante a la lactosa, vegetariano (opcional)"
              value={dietaryPreferences}
              onChange={(e) => setDietaryPreferences(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="pt-4">
          <Button fullWidth loading={loading} type="submit">
            Guardar mis datos
          </Button>
        </div>
      </form>
    </Modal>
  );
}
