import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Exercise, RoutineDay } from '@prisma/client';
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

3. MÓDULO DE PROPUESTA CLÍNICA DE RUTINAS:
   Cuando el entrenador te pida cambiar, mejorar o adaptar un ejercicio o rutina, O cuando diagnostiques en un atleta una molestia, lesión, sobrecarga o estancamiento que requiera sustituir un ejercicio:
   - Explica con claridad médica y calidez tu diagnóstico fisiológico y biomecánico.
   - OBLIGATORIAMENTE añade al final de tu mensaje este bloque estructurado para que el entrenador pueda revisarlo y aplicarlo con un solo clic:
   [PROPUESTA_RUTINA: {"clientName": "NombreDelAtleta", "routineName": "NombreDeLaRutina", "dayFocus": "EnfoqueDelDia", "currentExercise": {"name": "EjercicioActual", "setsReps": "4 x 8-10"}, "proposedExercise": {"name": "NuevoEjercicioSustituto", "setsReps": "4 x 10-12"}, "rationale": "Criterio biomecánico y clínico breve"}]
   - Utiliza siempre los nombres de atletas, rutinas y ejercicios reales de la telemetría.

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
        role:
          msg.role === 'clinical_ai' ? ('model' as const) : ('user' as const),
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

      // Clean up legacy command tags or stray UUIDs, but preserve [PROPUESTA_RUTINA: ...]
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

  async applyRoutineAdjustment(
    trainerId: string,
    payload: {
      clientName: string;
      oldExercise: string;
      newExercise: string;
      rationale?: string;
      routineName?: string;
    },
  ) {
    const { clientName, oldExercise, newExercise, rationale, routineName } =
      payload;
    if (!clientName || !oldExercise || !newExercise) {
      throw new Error('Faltan datos requeridos para aplicar la modificación');
    }

    // 1. Search athlete by name (case-insensitive)
    const athlete = await this.prisma.user.findFirst({
      where: {
        name: { contains: clientName, mode: 'insensitive' },
        role: 'client',
      },
    });

    if (!athlete) {
      throw new Error(
        `No se encontró al atleta "${clientName}" en tu cartera.`,
      );
    }

    // 2. Search active routine (or matching routineName)
    let routine = await this.prisma.routine.findFirst({
      where: {
        clientId: athlete.id,
        isActive: true,
      },
      include: {
        routineDays: {
          include: {
            exercises: true,
          },
        },
      },
    });

    if (!routine && routineName) {
      routine = await this.prisma.routine.findFirst({
        where: {
          clientId: athlete.id,
          name: { contains: routineName, mode: 'insensitive' },
        },
        include: {
          routineDays: {
            include: {
              exercises: true,
            },
          },
        },
      });
    }

    if (!routine) {
      throw new Error(
        `El atleta "${athlete.name}" no tiene una rutina activa para modificar.`,
      );
    }

    // 3. Search exercise to substitute
    let matchedExercise: Exercise | null = null;
    let matchedDay: RoutineDay | null = null;

    for (const day of routine.routineDays) {
      const found = day.exercises.find((ex) => {
        const exLow = ex.name.toLowerCase();
        const oldLow = oldExercise.toLowerCase();
        return exLow.includes(oldLow) || oldLow.includes(exLow);
      });
      if (found) {
        matchedExercise = found;
        matchedDay = day;
        break;
      }
    }

    // Fallback: word overlap
    if (!matchedExercise) {
      const words = oldExercise
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      for (const day of routine.routineDays) {
        const found = day.exercises.find((ex) => {
          const exLow = ex.name.toLowerCase();
          return words.some((w) => exLow.includes(w));
        });
        if (found) {
          matchedExercise = found;
          matchedDay = day;
          break;
        }
      }
    }

    if (!matchedExercise) {
      throw new Error(
        `No se encontró el ejercicio "${oldExercise}" en la rutina activa de ${athlete.name}.`,
      );
    }

    // 4. Update the exercise with the new name and clinical rationale
    const updatedObs = [
      matchedExercise.observations,
      rationale ? `[Ajuste Clínico IA: ${rationale}]` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    await this.prisma.exercise.update({
      where: { id: matchedExercise.id },
      data: {
        name: newExercise,
        observations: updatedObs,
      },
    });

    await this.prisma.routine.update({
      where: { id: routine.id },
      data: { updatedAt: new Date() },
    });

    this.logger.log(
      `✅ Ajuste clínico aplicado: "${matchedExercise.name}" -> "${newExercise}" para ${athlete.name} por entrenador ${trainerId}`,
    );

    return {
      success: true,
      message: `¡Rutina actualizada! Se sustituyó "${matchedExercise.name}" por "${newExercise}" en la rutina de ${athlete.name}.`,
      clientName: athlete.name,
      routineName: routine.name,
      oldExercise: matchedExercise.name,
      newExercise,
      dayFocus: matchedDay?.focusArea || 'Día Activo',
    };
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
