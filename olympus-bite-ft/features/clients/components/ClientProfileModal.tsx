import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import type { User } from "@/shared/types/common.types";
import { formatDate } from "@/shared/lib/utils";
import { FITNESS_GOALS } from "@/features/meals/types/meals.types";
import { ClientMealsProgress } from "./ClientMealsProgress";
import { ClientAiChat } from "./ClientAiChat";

interface ClientProfileModalProps {
  client: User | null;
  onClose: () => void;
  onSave: (
    clientId: string,
    data: { dietaryGoal?: string; targetCalories?: number | null },
  ) => Promise<void>;
}

export function ClientProfileModal({
  client,
  onClose,
  onSave,
}: ClientProfileModalProps) {
  const [goal, setGoal] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "progress" | "ai">(
    "profile",
  );

  useEffect(() => {
    if (client) {
      setGoal(client.dietaryGoal || "");
      setCalories(client.targetCalories?.toString() || "");
    }
  }, [client]);

  if (!client) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const target = calories === "" ? null : Number(calories);
      await onSave(client.id, { dietaryGoal: goal, targetCalories: target });
      onClose();
    } catch (_err) {
      // Handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!client}
      onClose={onClose}
      title="Perfil del Cliente"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <Avatar name={client.name} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex flex-col sm:flex-row items-center gap-2">
              {client.name}
              <Badge variant={client.isActive ? "success" : "danger"}>
                {client.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </h2>
            <p className="text-sm text-neutral-500 mt-1">{client.email}</p>
            {client.phone && (
              <p className="text-sm text-neutral-500">📞 {client.phone}</p>
            )}
            <p className="text-xs text-neutral-400 mt-2">
              Miembro desde el {formatDate(client.createdAt)}
            </p>
          </div>
        </div>

        {/* Tabs Widget */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              activeTab === "profile"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            📋 Perfil
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              activeTab === "progress"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            📈 Progreso
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              activeTab === "ai"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            ✨ AI
          </button>
        </div>

        {/* Tab Content: Profile */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Informacion Medica y Fisica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                padding="sm"
                className="bg-neutral-50 dark:bg-neutral-800/50"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Medidas
                </h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Peso
                  </span>
                  <span className="font-medium dark:text-white">
                    {client.weight ? `${client.weight} kg` : "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Estatura
                  </span>
                  <span className="font-medium dark:text-white">
                    {client.height ? `${client.height} cm` : "--"}
                  </span>
                </div>
              </Card>

              <Card
                padding="sm"
                className="bg-neutral-50 dark:bg-neutral-800/50"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Perfil de Entrenamiento
                </h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Nivel
                  </span>
                  <span className="font-medium text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md dark:bg-blue-900/30 dark:text-blue-400">
                    {client.experienceLevel || "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Equipo
                  </span>
                  <span className="font-medium text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md dark:bg-purple-900/30 dark:text-purple-400">
                    {client.equipmentAccess || "--"}
                  </span>
                </div>
              </Card>
            </div>

            {/* Preferencias Médicas y Alimenticias */}
            {(client.medicalConditions || client.dietaryPreferences) && (
              <Card padding="sm" className="border-l-4 border-l-amber-500">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Consideraciones Especiales
                </h3>
                {client.medicalConditions && (
                  <p className="text-sm mb-2">
                    <strong className="text-neutral-700 dark:text-neutral-300">
                      🩺 Condiciones:
                    </strong>{" "}
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {client.medicalConditions}
                    </span>
                  </p>
                )}
                {client.dietaryPreferences && (
                  <p className="text-sm">
                    <strong className="text-neutral-700 dark:text-neutral-300">
                      🥦 Dieta/Alergias:
                    </strong>{" "}
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {client.dietaryPreferences}
                    </span>
                  </p>
                )}
              </Card>
            )}

            {/* Configuracion Nutricional (Editable) */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                ⚙️ Configuración Nutricional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Objetivo Principal
                  </label>
                  <select
                    className="w-full text-sm rounded-xl border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:border-primary-500 focus:ring-primary-500"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {Object.entries(FITNESS_GOALS).map(([key, goalDef]) => (
                      <option key={key} value={key}>
                        {goalDef.icon} {goalDef.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Calorías Diarias (Kcal)
                  </label>
                  <input
                    type="number"
                    className="w-full text-sm rounded-xl border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:border-primary-500 focus:ring-primary-500 placeholder-neutral-400"
                    value={calories}
                    placeholder="Ej. 2200"
                    onChange={(e) => setCalories(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button variant="secondary" fullWidth onClick={onClose}>
                Cancelar
              </Button>
              <Button fullWidth onClick={handleSave} loading={isSaving}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}

        {/* Tab Content: Progress */}
        {activeTab === "progress" && (
          <ClientMealsProgress
            clientId={client.id}
            targetCalories={client.targetCalories || null}
          />
        )}

        {/* Tab Content: AI Chat */}
        {activeTab === "ai" && <ClientAiChat client={client} />}
      </div>
    </Modal>
  );
}
