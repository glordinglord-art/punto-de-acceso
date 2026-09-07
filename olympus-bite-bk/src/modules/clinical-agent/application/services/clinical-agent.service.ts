import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface SendClinicalAgentMessageDto {
  message: string;
}

@Injectable()
export class ClinicalAgentService implements OnModuleInit {
  private readonly logger = new Logger(ClinicalAgentService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null =
    null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        '⚠️ GEMINI_API_KEY no configurada para ClinicalAgentService',
      );
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    this.logger.log(
      '✅ Gemini 2.5 Flash conectado para el Director Clínico IA',
    );
  }

  async processTrainerMessage(
    trainerId: string,
    userMessage: string,
  ): Promise<string> {
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new Error('Entrenador no encontrado');
    }

    // 1. Fetch trainer's full client portfolio (direct + shared)
    const directClients = await this.prisma.user.findMany({
      where: { trainerId, isActive: true, role: 'client' },
    });

    const sharedLinks = await this.prisma.trainerColleague.findMany({
      where: {
        OR: [
          { trainerAId: trainerId },
          { trainerBId: trainerId, mode: 'bidirectional' },
        ],
      },
    });

    const sharedClientIds = new Set<string>();
    for (const link of sharedLinks) {
      if (link.sharedClientIds && link.sharedClientIds.length > 0) {
        link.sharedClientIds.forEach((id) => sharedClientIds.add(id));
      }
    }

    const sharedClients =
      sharedClientIds.size > 0
        ? await this.prisma.user.findMany({
            where: {
              id: { in: Array.from(sharedClientIds) },
              isActive: true,
              role: 'client',
            },
          })
        : [];

    // Deduplicate all clients
    const clientMap = new Map<string, any>();
    directClients.forEach((c) => clientMap.set(c.id, c));
    sharedClients.forEach((c) => clientMap.set(c.id, c));
    const allClients = Array.from(clientMap.values());

    // 2. Fetch today's telemetry for all clients
    const todayStr = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfToday = new Date(`${todayStr}T23:59:59.999Z`);
    const clientIds = allClients.map((c) => c.id);

    const [todayMeals, todayStress, activeRoutines] = await Promise.all([
      this.prisma.meal.findMany({
        where: {
          userId: { in: clientIds },
          date: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.dailyStressLog.findMany({
        where: {
          userId: { in: clientIds },
          date: todayStr,
        },
      }),
      this.prisma.routine.findMany({
        where: {
          clientId: { in: clientIds },
          isActive: true,
        },
        include: {
          routineDays: {
            include: {
              exercises: true,
            },
          },
        },
      }),
    ]);

    // Build comprehensive clinical portfolio context
    const clientsContextSummary = allClients
      .map((c) => {
        const cMeals = todayMeals.filter((m) => m.userId === c.id);
        const cStress = todayStress.find((s) => s.userId === c.id);
        const cRoutine = activeRoutines.find((r) => r.clientId === c.id);

        const totalKcal = cMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
        const totalProt = cMeals.reduce((acc, m) => acc + (m.protein || 0), 0);

        let sleepInfo = 'No registrado';
        if (cStress?.notes) {
          try {
            const parsed = JSON.parse(cStress.notes);
            if (parsed.sleepHours) {
              sleepInfo = `${parsed.sleepHours}h (${parsed.sleepQuality || 'Normal'})`;
            }
          } catch {
            // Plain text
          }
        }

        const routineDetails = cRoutine
          ? `Rutina: "${cRoutine.name}" (${cRoutine.routineDays.length} días configurados). Ejercicios clave: ${cRoutine.routineDays
              .flatMap((d) => d.exercises.map((e) => e.name))
              .slice(0, 6)
              .join(', ')}`
          : 'Sin rutina activa asignada';

        return `
- ATLETA: ${c.name}
  • Objetivo Biológico: ${c.dietaryGoal || 'Mantenimiento / Recomposición'} | Calorías Meta: ${c.targetCalories || 2200} kcal
  • Biometría: Peso ${c.weight ? `${c.weight} kg` : 'No registrado'}, Altura ${c.height ? `${c.height} cm` : 'No registrada'}
  • Perfil Clínico / Lesiones: ${c.medicalConditions || 'Sin lesiones reportadas'}
  • Nivel / Equipamiento: ${c.experienceLevel || 'Intermedio'} / ${c.equipmentAccess || 'Gimnasio completo'}
  • Telemetría de Hoy:
    - Comidas: ${cMeals.length > 0 ? `${cMeals.length} comidas (${totalKcal} kcal, ${totalProt}g proteína)` : 'Sin comidas registradas hoy'}
    - Estrés / Ánimo: ${cStress ? `Nivel ${cStress.stressLevel}/10 (${cStress.mood || 'Normal'})` : 'No registrado hoy'}
    - Sueño: ${sleepInfo}
  • Plan de Entrenamiento: ${routineDetails}
`;
      })
      .join('\n');

    // 3. System Prompt: The Grand Master Clinical Director
    const systemInstruction = `
Eres el DIRECTOR CLÍNICO, METABÓLICO Y BIOMECÁNICO SUPREMO de Vital Fit.
Actúas como la mano derecha médica y fisiológica del entrenador ${trainer.name}.

REGLAS DE COMUNICACIÓN Y FORMATO (INNEGOCIABLES):
1. TONO HUMANO, CLARO Y EJECUTIVO:
   - Hablas en un español impecable, cálido, profesional y natural.
   - NUNCA uses jerga de programador ni menciones IDs, bases de datos o códigos.
   - ESTÁ ESTRICTAMENTE PROHIBIDO mostrar llaves {}, JSONs, o etiquetas como [COMANDO_RUTINA] en consultas de banderas rojas o preguntas generales.
   - NO satures el texto con asteriscos amontonados (* **Palabra:** **Otra:**). Usa saltos de línea elegantes y viñetas limpias.

2. ESTRUCTURA PARA REPORTES DE BANDERAS ROJAS / ATLETAS:
   Cuando el coach pregunte por banderas rojas o estado de sus alumnos, presenta a cada uno con esta estructura limpia:

   ### 🚨 [Nombre del Atleta]
   • **Situación:** Breve explicación en 1 frase clara (ej: "Su peso registrado es de 33 kg, lo cual indica un posible error al digitar o un caso de desnutrición severa").
   • **Impacto Biológico:** 1 línea explicando el porqué fisiológico.
   • **Acción Recomendada:** Consejo práctico y directo para el entrenador.

3. COMANDOS EXCLUSIVOS PARA CAMBIO DE RUTINAS:
   ÚNICAMENTE si el entrenador te ordena EXPLÍCITAMENTE cambiar un ejercicio por otro (ej: "Cambia la sentadilla de Carlos por prensa 45°"), añade al final de tu respuesta:
   [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "replace_exercise", "oldExercise": "ejercicio_anterior", "newExercise": "ejercicio_nuevo", "rationale": "fundamento_biomecánico"}]
   En cualquier otra situación, ¡NUNCA emitas esta etiqueta!

4. CORPUS CIENTÍFICO DE SOPORTE (Lehninger, Guyton & Hall, Schoenfeld, Israetel, Beardsley, Zatsiorsky):
   - Prioriza la recuperación celular (MPS via mTORC1 vs AMPK).
   - Plano escapular ante dolor de hombro; prensa 45° o apoyo esternal ante dolor lumbar; bisagra de cadera ante gonalgias.
   - Filosofía estoica y antifragilidad: consistencia y salud articular sobre ego en las cargas.

TELEMETRÍA EN VIVO DE LOS ATLETAS DE ${trainer.name.toUpperCase()}:
${clientsContextSummary}
`;

    // 4. Check if trainer's prompt includes a routine change request
    if (!this.genAI || !this.model) {
      return '⚠️ El servicio de Director Clínico IA no tiene configurada la clave API de Gemini.';
    }

    // Fetch last 6 chat history messages for context continuity
    const history = await this.prisma.dietChatMessage.findMany({
      where: {
        userId: trainerId,
        role: { in: ['clinical_user', 'clinical_ai'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    const chronologicalHistory = history.reverse();

    const contents = [
      { role: 'user' as const, parts: [{ text: systemInstruction }] },
      {
        role: 'model' as const,
        parts: [
          {
            text: `Entendido Coach ${trainer.name}. Tengo en memoria el perfil clínico, biomecánico y nutricional de todos tus ${allClients.length} atletas. ¿En qué optimizamos el rendimiento hoy?`,
          },
        ],
      },
    ];

    chronologicalHistory.forEach((msg) => {
      contents.push({
        role: msg.role === 'clinical_ai' ? ('model' as const) : ('user' as const),
        parts: [{ text: msg.content }],
      });
    });

    contents.push({
      role: 'user' as const,
      parts: [{ text: userMessage }],
    });

    try {
      const response = await this.model.generateContent({
        contents,
      });

      let replyText = response.response.text();

      // Check if response contains any [COMANDO_RUTINA: ...] block and process it
      const commandMatches = [...replyText.matchAll(/\[COMANDO_RUTINA:\s*(\{.*?\})\]/gs)];
      for (const match of commandMatches) {
        try {
          const cmd = JSON.parse(match[1]);
          if ((cmd.clientName || cmd.clientId) && cmd.oldExercise && cmd.newExercise) {
            await this.executeRoutineReplacement(
              cmd.clientId,
              cmd.clientName,
              cmd.oldExercise,
              cmd.newExercise,
              cmd.rationale,
            );
            replyText = replyText.replace(
              match[0],
              `\n> 🩺 **Ajuste Clínico Aplicado:** Se sustituyó *${cmd.oldExercise}* por *${cmd.newExercise}* en la rutina activa de ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else {
            // Remove unhandled/spurious command completely
            replyText = replyText.replace(match[0], '');
          }
        } catch {
          replyText = replyText.replace(match[0], '');
        }
      }

      // Cleanup: strip any leftover command tags, JSON leftovers or raw UUIDs
      replyText = replyText
        .replace(/\[COMANDO_RUTINA:[^\]]*\]/gs, '')
        .replace(/\(ID:\s*[0-9a-f-]{10,}\)/gi, '')
        .trim();

      // Save to chat history with clinical roles so they never collide with meal/diet chat
      await this.prisma.dietChatMessage.createMany({
        data: [
          { userId: trainerId, role: 'clinical_user', content: userMessage },
          { userId: trainerId, role: 'clinical_ai', content: replyText },
        ],
      });

      return replyText;
    } catch (err) {
      this.logger.error('Error en ClinicalAgentService:', err);
      return 'Lo siento Coach, hubo una sobrecarga en la conexión con el motor clínico. Por favor intenta tu consulta de nuevo.';
    }
  }

  private async executeRoutineReplacement(
    clientId?: string,
    clientName?: string,
    oldExerciseName?: string,
    newExerciseName?: string,
    rationale?: string,
  ) {
    if (!oldExerciseName || !newExerciseName) return;

    let targetId = clientId;
    if (!targetId && clientName) {
      const athlete = await this.prisma.user.findFirst({
        where: { name: { contains: clientName, mode: 'insensitive' } },
      });
      if (athlete) targetId = athlete.id;
    }

    if (!targetId) return;

    const routine = await this.prisma.routine.findFirst({
      where: { clientId: targetId, isActive: true },
      include: {
        routineDays: {
          include: {
            exercises: true,
          },
        },
      },
    });

    if (!routine) return;

    // Search for exercise matching oldExerciseName (case-insensitive)
    for (const day of routine.routineDays) {
      const target = day.exercises.find((ex) =>
        ex.name.toLowerCase().includes(oldExerciseName.toLowerCase()),
      );
      if (target) {
        const updatedObs = [
          target.observations,
          rationale ? `[Clínico: ${rationale}]` : null,
        ]
          .filter(Boolean)
          .join(' · ');

        await this.prisma.exercise.update({
          where: { id: target.id },
          data: {
            name: newExerciseName,
            observations: updatedObs,
          },
        });

        await this.prisma.routine.update({
          where: { id: routine.id },
          data: { updatedAt: new Date() },
        });
        break;
      }
    }
  }

  async getChatHistory(trainerId: string) {
    const rows = await this.prisma.dietChatMessage.findMany({
      where: {
        userId: trainerId,
        role: { in: ['clinical_user', 'clinical_ai'] },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id,
      role: r.role === 'clinical_user' ? ('user' as const) : ('ai' as const),
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async clearChatHistory(trainerId: string) {
    await this.prisma.dietChatMessage.deleteMany({
      where: {
        userId: trainerId,
        role: { in: ['clinical_user', 'clinical_ai'] },
      },
    });
    return { success: true };
  }
}
