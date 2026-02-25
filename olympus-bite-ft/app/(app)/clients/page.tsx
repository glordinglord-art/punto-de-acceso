"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { Modal } from "@/shared/components/ui/Modal";
import { clientsService } from "@/features/clients/services/clients.service";
import { authService } from "@/features/auth/services/auth.service";
import { ClientProfileModal } from "@/features/clients/components/ClientProfileModal";
import type { User } from "@/shared/types/common.types";
import { formatDate } from "@/shared/lib/utils";
import { FITNESS_GOALS } from "@/features/meals/types/meals.types";

interface InvCode {
  id: string;
  code: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [existingCodes, setExistingCodes] = useState<InvCode[]>([]);
  const [showCodesPanel, setShowCodesPanel] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);

  const loadClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await clientsService.getByTrainer(user.id);
      setClients(res.data ?? []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleGenerateCode = async () => {
    if (!user) return;
    setCodeLoading(true);
    try {
      const res = await authService.generateCode(user.id);
      setGeneratedCode(res.data.code);
      setShowCodeModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error generando código");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleShowCodes = async () => {
    if (!user) return;
    try {
      const res = await authService.getCodes(user.id);
      setExistingCodes(res.data ?? []);
      setShowCodesPanel(true);
    } catch {
      setExistingCodes([]);
      setShowCodesPanel(true);
    }
  };

  const handleSaveProfile = async (
    clientId: string,
    data: { dietaryGoal?: string; targetCalories?: number | null },
  ) => {
    try {
      await clientsService.updateProfile(clientId, data);
      setClients(
        clients.map((c) =>
          c.id === clientId
            ? {
                ...c,
                dietaryGoal:
                  data.dietaryGoal !== undefined
                    ? data.dietaryGoal
                    : c.dietaryGoal,
                targetCalories:
                  data.targetCalories !== undefined
                    ? data.targetCalories
                    : c.targetCalories,
              }
            : c,
        ),
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Error actualizando el perfil del cliente",
      );
    }
  };

  return (
    <>
      <Header
        title="Clientes"
        subtitle={
          loading ? "Cargando..." : `${clients.length} clientes registrados`
        }
        action={
          <div className="flex gap-2">
            <Button onClick={handleShowCodes} variant="secondary" size="md">
              📋 Ver códigos
            </Button>
            <Button
              onClick={handleGenerateCode}
              size="md"
              loading={codeLoading}
            >
              🔑 Generar código
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center dark:border-neutral-700">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Sin clientes aún
          </h3>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Genera un código de invitación y compártelo con tus clientes para
            que se registren en la plataforma.
          </p>
          <Button
            onClick={handleGenerateCode}
            className="mt-6"
            loading={codeLoading}
          >
            🔑 Generar primer código
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <Card
              key={client.id}
              hover
              className="cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex items-center gap-4">
                <Avatar name={client.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {client.name}
                    </h3>
                    <Badge variant={client.isActive ? "success" : "danger"}>
                      {client.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {client.email}
                  </p>

                  {/* Advanced Profile Pills */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {client.experienceLevel && (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                        🏋️ {client.experienceLevel}
                      </span>
                    )}
                    {client.equipmentAccess && (
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-400/10 dark:text-purple-400 dark:ring-purple-400/30">
                        🛠️ {client.equipmentAccess}
                      </span>
                    )}
                  </div>

                  {(client.medicalConditions || client.dietaryPreferences) && (
                    <div className="mt-2 space-y-1">
                      {client.medicalConditions && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          <strong className="font-semibold">Condición:</strong>{" "}
                          {client.medicalConditions}
                        </p>
                      )}
                      {client.dietaryPreferences && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          <strong className="font-semibold">
                            Dieta/Alergias:
                          </strong>{" "}
                          {client.dietaryPreferences}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-6 text-center">
                  <div>
                    <p className="text-xs text-neutral-400">Objetivo</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                      {client.dietaryGoal
                        ? FITNESS_GOALS[
                            client.dietaryGoal as keyof typeof FITNESS_GOALS
                          ]?.label || client.dietaryGoal
                        : "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">Kcal Diarias</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {client.targetCalories
                        ? `${client.targetCalories} kcal`
                        : "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">Registrado</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formatDate(client.createdAt)}
                    </p>
                  </div>
                </div>

                <svg
                  className="h-5 w-5 text-neutral-300 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Generated Code Modal */}
      <Modal
        isOpen={showCodeModal}
        onClose={() => {
          setShowCodeModal(false);
          setGeneratedCode(null);
        }}
        title="Código de invitación"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
            <span className="text-3xl">🔑</span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Comparte este código con tu nuevo cliente para que pueda registrarse
          </p>
          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
            <p className="text-3xl font-bold tracking-widest text-neutral-900 dark:text-white">
              {generatedCode}
            </p>
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            Válido por 7 días · Un solo uso
          </p>
          <Button
            className="mt-6"
            fullWidth
            onClick={() => {
              navigator.clipboard.writeText(generatedCode ?? "");
            }}
          >
            📋 Copiar código
          </Button>
        </div>
      </Modal>

      {/* Existing Codes Modal */}
      <Modal
        isOpen={showCodesPanel}
        onClose={() => setShowCodesPanel(false)}
        title="Códigos de invitación"
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {existingCodes.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-4">
              No has generado códigos aún
            </p>
          ) : (
            existingCodes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between rounded-xl border border-neutral-100 p-3 dark:border-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-neutral-900 dark:text-white">
                    {code.code}
                  </span>
                  <Badge variant={code.isUsed ? "danger" : "success"}>
                    {code.isUsed ? "Usado" : "Disponible"}
                  </Badge>
                </div>
                <div className="text-xs text-neutral-400">
                  Expira: {formatDate(code.expiresAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      <ClientProfileModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onSave={handleSaveProfile}
      />
    </>
  );
}
