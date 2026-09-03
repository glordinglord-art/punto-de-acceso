import { useState, useEffect } from "react";
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
import { UserComplianceModule } from "@/features/dashboard/components/UserComplianceModule";
import { ClientAssessmentsTab } from "@/features/assessments/components/ClientAssessmentsTab";
import { Settings, Target, Flame, Activity, ShieldAlert, HeartPulse, UserCircle, LineChart, Sparkles, Key, Ruler } from "lucide-react";

interface ClientProfileModalProps {
  client: User | null;
  initialTab?: "profile" | "assessments" | "progress" | "compliance" | "ai";
  onClose: () => void;
  onSave: (
    clientId: string,
    data: { dietaryGoal?: string; targetCalories?: number | null; password?: string },
  ) => Promise<void>;
  onDelete?: (clientId: string) => Promise<void>;
}

export function ClientProfileModal({
  client,
  initialTab = "profile",
  onClose,
  onSave,
  onDelete,
}: ClientProfileModalProps) {
  const [goal, setGoal] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "assessments" | "progress" | "compliance" | "ai">(
    initialTab,
  );

  useEffect(() => {
    if (client) {
      setGoal(client.dietaryGoal || "");
      setCalories(client.targetCalories?.toString() || "");
      setPassword("");
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [client, initialTab]);

  if (!client) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const target = calories === "" ? null : Number(calories);
      await onSave(client.id, {
        dietaryGoal: goal,
        targetCalories: target,
        password: password === "" ? undefined : password,
      });
      onClose();
    } catch {
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
      size="xl"
      noPadding={true}
      className="overflow-hidden max-w-5xl"
    >
      <div className="relative">
        {/* Banner with VITALFIT crimson titanium gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-[#180305] via-[#28060a] to-[#070102] border-b border-red-500/20 z-0">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="relative z-10 pt-16 px-4 sm:px-8 pb-8">
          {/* Header Profile Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left mb-6">
            <div className="relative">
              <Avatar name={client.name} size="xl" className="w-24 h-24 text-3xl ring-4 ring-neutral-900 shadow-2xl" />
              <div className="absolute bottom-0 right-0">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 border-neutral-900 shadow-sm",
                  client.isActive ? "bg-emerald-500" : "bg-red-500"
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

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-sm font-medium text-neutral-400">
                <span>{client.email}</span>
                {client.phone && (
                  <>
                    <span>•</span>
                    <a
                      href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-bold font-mono text-xs bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full"
                      title="Abrir chat en WhatsApp"
                    >
                      💬 {client.phone}
                    </a>
                  </>
                )}
              </div>

              <p className="text-xs font-condensed font-bold uppercase tracking-widest text-red-500 mt-2">
                MIEMBRO DESDE {formatDate(client.createdAt)}
              </p>
            </div>
          </div>

          {/* Tabs Widget with horizontal scroll on mobile */}
          <div className="flex bg-neutral-100 dark:bg-black/60 p-1.5 rounded-2xl border border-neutral-200 dark:border-white/10 mb-6 overflow-x-auto no-scrollbar gap-1.5">
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "flex-1 min-w-[95px] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-condensed font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all duration-200 whitespace-nowrap",
                activeTab === "profile"
                  ? "bg-white dark:bg-white/15 text-red-500 dark:text-red-400 shadow-sm ring-1 ring-white/10"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <UserCircle className="w-4 h-4 text-red-500 shrink-0" /> Perfil
            </button>
            <button
              onClick={() => setActiveTab("assessments")}
              className={cn(
                "flex-1 min-w-[115px] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-condensed font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all duration-200 whitespace-nowrap",
                activeTab === "assessments"
                  ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-400"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Ruler className="w-4 h-4 text-white shrink-0" /> Valoraciones
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={cn(
                "flex-1 min-w-[95px] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-condensed font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all duration-200 whitespace-nowrap",
                activeTab === "progress"
                  ? "bg-white dark:bg-white/15 text-red-500 dark:text-red-400 shadow-sm ring-1 ring-white/10"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <LineChart className="w-4 h-4 text-red-500 shrink-0" /> Progreso
            </button>
            <button
              onClick={() => setActiveTab("compliance")}
              className={cn(
                "flex-1 min-w-[130px] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-condensed font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all duration-200 whitespace-nowrap",
                activeTab === "compliance"
                  ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-400"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Activity className="w-4 h-4 text-white shrink-0" /> Rendimiento & %
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={cn(
                "flex-1 min-w-[120px] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-condensed font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all duration-200 whitespace-nowrap",
                activeTab === "ai"
                  ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-500/25"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" /> Asistente AI
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
                          {client.weight ? `${client.weight} kg` : "--"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-black/20 border border-neutral-100 dark:border-white/5">
                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Estatura
                        </span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {client.height ? `${client.height} cm` : "--"}
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
                
                {/* Reset Password Row */}
                <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-white/5">
                  <label className="block text-xs font-condensed font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-neutral-400" /> Restablecer Contraseña del Cliente
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm font-medium rounded-xl border-2 border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/20 dark:text-white py-3 px-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 placeholder-neutral-400 transition-all"
                    placeholder="Escribe una nueva contraseña para el cliente si deseas cambiarla..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 mt-2">
                    Si ingresas texto aquí, la clave de acceso de este cliente se actualizará automáticamente al guardar.
                  </p>
                </div>
              </div>
              
              {/* Danger Zone */}
              {onDelete && (
                <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20 p-5 shadow-sm">
                  <h3 className="text-sm font-condensed font-bold uppercase tracking-wide text-red-900 dark:text-red-400 mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Zona de Peligro
                  </h3>
                  <p className="text-[11px] font-medium text-red-700 dark:text-red-300 mb-4 leading-relaxed">
                    Eliminar a este cliente borrará de forma permanente todo su historial de rutinas, comidas y datos de progreso.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-red-600 dark:text-red-400 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 font-condensed font-bold uppercase tracking-wider"
                    onClick={() => onDelete(client.id)}
                  >
                    Eliminar Cliente
                  </Button>
                </div>
              )}

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

          {/* Tab Content: Physical Assessments (Valoraciones Corporales) */}
          {activeTab === "assessments" && (
            <div className="animate-in fade-in duration-300">
              <ClientAssessmentsTab clientId={client.id} isTrainer={true} />
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

          {/* Tab Content: Compliance & Percentages */}
          {activeTab === "compliance" && (
            <div className="animate-in fade-in duration-300">
              <UserComplianceModule
                userId={client.id}
                userName={client.name}
                isTrainer={true}
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
