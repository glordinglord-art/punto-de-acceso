const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'olympus-bite-ft/features/clients/components/ClientProfileModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newContent = `import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import type { User } from "@/shared/types/common.types";
import { cn, formatDate } from "@/shared/lib/utils";
import { FITNESS_GOALS } from "@/features/meals/types/meals.types";
import { ClientMealsProgress } from "./ClientMealsProgress";
import { ClientAiChat } from "./ClientAiChat";
import { Settings, Target, Flame, Activity, ShieldAlert, HeartPulse, UserCircle, LineChart, Sparkles } from "lucide-react";

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
      title=""
      size="lg"
      className="p-0 overflow-hidden bg-white dark:bg-neutral-900 border-none sm:rounded-3xl"
    >
      <div className="relative">
        {/* Banner with gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 dark:from-primary-900 dark:via-primary-800 dark:to-emerald-900 z-0">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          {/* Abstract pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
            <pattern id="pattern-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-grid)" />
          </svg>
        </div>

        <div className="relative z-10 pt-16 px-6 sm:px-8 pb-8">
          {/* Header Profile Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left mb-8">
            <div className="relative">
              <Avatar name={client.name} size="xl" className="w-24 h-24 text-3xl ring-4 ring-white dark:ring-neutral-900 shadow-xl" />
              <div className="absolute bottom-0 right-0">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 border-white dark:border-neutral-900 shadow-sm",
                  client.isActive ? "bg-green-500" : "bg-red-500"
                )} />
              </div>
            </div>
            
            <div className="flex-1 pb-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
                <h2 className="text-2xl font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
                  {client.name}
                </h2>
                <Badge variant={client.isActive ? "success" : "danger"} className="shadow-sm">
                  {client.isActive ? "ACTIVO" : "INACTIVO"}
                </Badge>
              </div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                {client.email} {client.phone && <span className="mx-2">•</span>} {client.phone}
              </p>
              <p className="text-xs font-condensed font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mt-2">
                MIEMBRO DESDE {formatDate(client.createdAt)}
              </p>
            </div>
          </div>

          {/* Tabs Widget */}
          <div className="flex bg-neutral-100 dark:bg-black/40 p-1.5 rounded-xl border border-neutral-200 dark:border-white/5 mb-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 text-sm font-condensed font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all duration-200",
                activeTab === "profile"
                  ? "bg-white dark:bg-white/10 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-white/50 dark:hover:bg-white/5"
              )}
            >
              <UserCircle className="w-4 h-4" /> Perfil
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 text-sm font-condensed font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all duration-200",
                activeTab === "progress"
                  ? "bg-white dark:bg-white/10 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-white/50 dark:hover:bg-white/5"
              )}
            >
              <LineChart className="w-4 h-4" /> Progreso
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 text-sm font-condensed font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all duration-200",
                activeTab === "ai"
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-purple-500/20"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-white/50 dark:hover:bg-white/5"
              )}
            >
              <Sparkles className="w-4 h-4" /> Asistente AI
            </button>
          </div>

          {/* Tab Content: Profile */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Informacion Medica y Fisica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                  className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                >
                  <div className="p-4">
                    <h3 className="flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
                      <Target className="w-4 h-4 text-primary-500" /> Biometría
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-black/20 border border-neutral-100 dark:border-white/5">
                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Peso
                        </span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {client.weight ? \`\${client.weight} kg\` : "--"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-black/20 border border-neutral-100 dark:border-white/5">
                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Estatura
                        </span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {client.height ? \`\${client.height} cm\` : "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                >
                  <div className="p-4">
                    <h3 className="flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
                      <Activity className="w-4 h-4 text-primary-500" /> Entrenamiento
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-black/20 border border-neutral-100 dark:border-white/5">
                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Nivel
                        </span>
                        <span className="font-condensed font-bold uppercase tracking-wider text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md dark:bg-blue-500/20 dark:text-blue-300">
                          {client.experienceLevel || "--"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-black/20 border border-neutral-100 dark:border-white/5">
                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Equipo
                        </span>
                        <span className="font-condensed font-bold uppercase tracking-wider text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md dark:bg-purple-500/20 dark:text-purple-300">
                          {client.equipmentAccess || "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Preferencias Médicas y Alimenticias */}
              {(client.medicalConditions || client.dietaryPreferences) && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl p-4">
                  <h3 className="flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500 mb-3">
                    <ShieldAlert className="w-4 h-4" /> Consideraciones Especiales
                  </h3>
                  <div className="space-y-2">
                    {client.medicalConditions && (
                      <p className="text-sm flex items-start gap-2">
                        <HeartPulse className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-amber-800 dark:text-amber-200">
                          <strong className="font-bold">CONDICIONES:</strong> {client.medicalConditions}
                        </span>
                      </p>
                    )}
                    {client.dietaryPreferences && (
                      <p className="text-sm flex items-start gap-2">
                        <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                        <span className="text-amber-800 dark:text-amber-200">
                          <strong className="font-bold">DIETA/ALERGIAS:</strong> {client.dietaryPreferences}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Configuracion Nutricional (Editable) */}
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-neutral-200 dark:border-white/10 p-5 shadow-sm">
                <h3 className="text-sm font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-neutral-500" /> Configuración del Plan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-condensed font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                      Objetivo Principal
                    </label>
                    <div className="relative">
                      <select
                        className="w-full text-sm font-medium rounded-xl border-2 border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/20 dark:text-white py-3 pl-4 pr-10 appearance-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {Object.entries(FITNESS_GOALS).map(([key, goalDef]) => (
                          <option key={key} value={key}>
                            {goalDef.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-condensed font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                      Meta Diaria (Kcal)
                    </label>
                    <input
                      type="number"
                      className="w-full text-sm font-bold rounded-xl border-2 border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/20 dark:text-white py-3 px-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 placeholder-neutral-400 transition-all"
                      value={calories}
                      placeholder="Ej. 2200"
                      onChange={(e) => setCalories(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-white/10">
                <Button variant="ghost" size="lg" className="w-full font-condensed font-bold uppercase tracking-wider" onClick={onClose}>
                  Cerrar
                </Button>
                <Button size="lg" className="w-full font-condensed font-bold uppercase tracking-wider shadow-lg shadow-primary-500/20" onClick={handleSave} loading={isSaving}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}

          {/* Tab Content: Progress */}
          {activeTab === "progress" && (
            <div className="animate-in fade-in duration-300">
              <ClientMealsProgress
                clientId={client.id}
                targetCalories={client.targetCalories || null}
              />
            </div>
          )}

          {/* Tab Content: AI Chat */}
          {activeTab === "ai" && (
            <div className="animate-in fade-in duration-300 h-[500px] border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-inner">
              <ClientAiChat client={client} />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
`;

fs.writeFileSync(filePath, newContent);
console.log('Done replacing ClientProfileModal.tsx');
