import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Exercise, MuscleGroup, RoutineDay } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface SendClinicalAgentMessageDto {
  message: string;
}

@Injectable()
export class ClinicalAgentService implements OnModuleInit {
  private readonly logger = new Logger(ClinicalAgentService.name);
  private geminiKeys: string[] = [];
  private mimoApiKey: string | null = null;
  private mimoBaseUrl = 'https://api.xiaomimimo.com/v1';

  private static readonly GEMINI_MODELS = [
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash-lite',
  ];

  constructor(private readonly prisma: PrismaService) {}

  private getModelsForKey(key: string): string[] {
    if (key.startsWith('AQ.')) {
      // Clave nueva de Google AI Studio (Proyecto 2026) -> Serie Gemini 3.x
      return [
        'gemini-3.5-flash-lite', // 500 peticiones/día (ultra rápido)
        'gemini-3.1-flash-lite', // 500 peticiones/día (ultra rápido)
        'gemini-3.6-flash', // 20 peticiones/día (alta inteligencia)
        'gemini-3.7-flash', // 20 peticiones/día
        'gemini-3.5-flash', // 20 peticiones/día
      ];
    } else {
      // Clave estándar AIzaSy... -> Serie Gemini 3.x + 2.5
      return [
        'gemini-3.5-flash-lite', // 500 peticiones/día (0.6s latencia)
        'gemini-3.1-flash-lite', // 500 peticiones/día (0.5s latencia)
        'gemini-3.6-flash', // 20 peticiones/día
        'gemini-3.7-flash', // 20 peticiones/día
        'gemini-3.5-flash', // 20 peticiones/día
        'gemini-2.5-flash-lite', // 20 peticiones/día
        'gemini-2.5-flash', // 20 peticiones/día
      ];
    }
  }

  onModuleInit() {
    const keys: string[] = [];
    // Priorizamos la clave con mayor cuota diaria (1000 RPD en Gemini 3.x)
    if (process.env.GEMINI_BACKUP_API_KEY) {
      keys.push(
        process.env.GEMINI_BACKUP_API_KEY.trim().replace(/^["']|["']$/g, ''),
      );
    }
    if (process.env.GEMINI_API_KEY) {
      keys.push(process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, ''));
    }
    this.geminiKeys = keys.filter(Boolean);

    this.mimoApiKey = process.env.MIMO_API_KEY
      ? process.env.MIMO_API_KEY.trim().replace(/^["']|["']$/g, '')
      : null;
    if (process.env.MIMO_BASE_URL) {
      this.mimoBaseUrl = process.env.MIMO_BASE_URL.trim().replace(
        /^["']|["']$/g,
        '',
      );
    }

    this.logger.log(
      `🚀 Pool de IA Director Clínico inicializado: ${this.geminiKeys.length} clave(s) Gemini + ${this.mimoApiKey ? 'Xiaomi MiMo v2.5 ACTIVO (Respaldo $2)' : 'Sin MiMo'}`,
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

3. MÓDULO DE CONTROL TOTAL DE RUTINAS:
   Tienes CONTROL ABSOLUTO sobre las rutinas de los atletas. Cuando el entrenador te pida cambiar, mejorar, crear, eliminar o adaptar cualquier aspecto de una rutina, o cuando diagnostiques una necesidad clínica:
   - Explica con claridad médica y calidez tu diagnóstico fisiológico y biomecánico.
   - OBLIGATORIAMENTE añade al final de tu mensaje UN bloque estructurado [ACCION_RUTINA: {...}] para que el entrenador lo apruebe con un clic.
   - NUNCA muestres el JSON en crudo ni lo pongas dentro de bloques de código. Siempre debe ir como [ACCION_RUTINA: {...}] en texto plano.

   ACCIONES DISPONIBLES:

   a) SUSTITUIR UN EJERCICIO por otro:
   [ACCION_RUTINA: {"action": "sustituir_ejercicio", "clientName": "NombreAtleta", "routineName": "NombreRutina", "dayFocus": "EnfoqueDelDia", "currentExercise": {"name": "EjercicioActual", "setsReps": "4 x 8-10"}, "proposedExercise": {"name": "NuevoEjercicio", "setsReps": "4 x 10-12"}, "rationale": "Criterio biomecánico breve"}]

   b) REEMPLAZAR TODOS LOS EJERCICIOS DE UN DÍA:
   [ACCION_RUTINA: {"action": "reemplazar_dia", "clientName": "NombreAtleta", "routineName": "NombreRutina", "dayNumber": 1, "dayFocus": "NuevoEnfoque", "currentExercises": ["Ejercicio1", "Ejercicio2"], "newExercises": [{"name": "Nuevo1", "sets": 4, "reps": "8-10", "muscleGroup": "chest", "restSeconds": 90}, {"name": "Nuevo2", "sets": 3, "reps": "10-12", "muscleGroup": "triceps", "restSeconds": 60}], "rationale": "Criterio clínico"}]

   c) AGREGAR EJERCICIO(S) A UN DÍA:
   [ACCION_RUTINA: {"action": "agregar_ejercicio", "clientName": "NombreAtleta", "routineName": "NombreRutina", "dayNumber": 2, "dayFocus": "Espalda", "exercises": [{"name": "Curl Martillo", "sets": 3, "reps": "10-12", "muscleGroup": "biceps", "restSeconds": 60}], "rationale": "Criterio clínico"}]

   d) ELIMINAR EJERCICIO(S) DE UN DÍA:
   [ACCION_RUTINA: {"action": "eliminar_ejercicio", "clientName": "NombreAtleta", "routineName": "NombreRutina", "dayFocus": "Pierna", "exercisesToRemove": ["Peso Muerto Rumano", "Extensión de Cuádriceps"], "rationale": "Criterio clínico"}]

   e) CREAR UNA RUTINA COMPLETA DESDE CERO:
   [ACCION_RUTINA: {"action": "crear_rutina", "clientName": "NombreAtleta", "routineName": "Nombre de la Nueva Rutina", "description": "Descripción breve", "weekCount": 4, "days": [{"dayNumber": 1, "focusArea": "Pierna y Empuje", "isRestDay": false, "exercises": [{"name": "Sentadilla", "sets": 4, "reps": "6-8", "muscleGroup": "quads", "restSeconds": 120}]}, {"dayNumber": 2, "focusArea": "Descanso", "isRestDay": true, "restDayNote": "Recuperación activa", "exercises": []}], "rationale": "Criterio clínico"}]

   f) ELIMINAR / DESACTIVAR UNA RUTINA:
   [ACCION_RUTINA: {"action": "eliminar_rutina", "clientName": "NombreAtleta", "routineName": "NombreRutina", "rationale": "Criterio clínico"}]

   REGLAS PARA LAS ACCIONES:
   - Utiliza SIEMPRE los nombres REALES de atletas, rutinas y ejercicios de la telemetría.
   - Los valores de muscleGroup DEBEN ser uno de: chest, back, shoulders, biceps, triceps, legs, glutes, abs, cardio, full_body, quads, hamstrings, calves, forearms, traps, core, abductors, adductors, hybrid.
   - Emite SOLO UN bloque [ACCION_RUTINA: ...] por mensaje. Si hay múltiples cambios, aplica el más urgente primero y pregunta si desea continuar.
   - Cuando el entrenador aplique un cambio, si consideras que aún faltan ajustes, menciónalo: "Nota: aún falta configurar X e Y para completar la transformación."

4. CORPUS CIENTÍFICO DE SOPORTE (Lehninger, Guyton & Hall, Schoenfeld, Israetel, Beardsley, Zatsiorsky):
   - Prioriza la recuperación celular (MPS via mTORC1 vs AMPK).
   - Plano escapular ante dolor de hombro; prensa 45° o apoyo esternal ante dolor lumbar; bisagra de cadera ante gonalgias.
   - Filosofía estoica y antifragilidad: consistencia y salud articular sobre ego en las cargas.

TELEMETRÍA EN VIVO DE LOS ATLETAS DE ${trainer.name.toUpperCase()}:
${clientsContextSummary}
`;

    if (this.geminiKeys.length === 0 && !this.mimoApiKey) {
      return '⚠️ El servicio de Director Clínico IA no tiene configurada ninguna API Key (ni Gemini ni MiMo).';
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
    const formattedHistory = chronologicalHistory.map((m) => ({
      role: m.role === 'clinical_ai' ? ('model' as const) : ('user' as const),
      content: m.content,
    }));

    let replyText = '';
    let providerUsed = '';

    // Intento 1: Cascada Multi-Modelo a través de todas las Claves de Gemini configuradas
    for (let k = 0; k < this.geminiKeys.length; k++) {
      const key = this.geminiKeys[k];
      const keyShort = `...${key.slice(-4)}`;
      const targetModels = this.getModelsForKey(key);

      for (const modelName of targetModels) {
        try {
          this.logger.log(
            `🩺 Consultando Director Clínico con [${modelName}] (Clave #${k + 1} ${keyShort})...`,
          );
          replyText = await this.callGemini(
            key,
            modelName,
            systemInstruction,
            formattedHistory,
            trainer.name,
            allClients.length,
            userMessage,
          );
          providerUsed = `${modelName} (Clave #${k + 1} ${keyShort})`;
          break;
        } catch (geminiErr: unknown) {
          const msg =
            geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
          this.logger.warn(
            `⚠️ [${modelName}] en Clave #${k + 1} (${keyShort}) falló (${msg.slice(0, 80)}). Conmutando al siguiente modelo...`,
          );
        }
      }

      if (replyText) break;
    }

    // Intento 2: Failover transparente a Xiaomi MiMo v2.5 (saldo de respaldo $2)
    if (!replyText && this.mimoApiKey) {
      try {
        this.logger.log(
          `🔄 [FAILOVER ACTIVO] Conmutando consulta clínica a Xiaomi MiMo v2.5...`,
        );
        replyText = await this.callMimo(
          systemInstruction,
          formattedHistory,
          trainer.name,
          allClients.length,
          userMessage,
        );
        providerUsed = 'Xiaomi MiMo v2.5';
      } catch (mimoErr: unknown) {
        const msg =
          mimoErr instanceof Error ? mimoErr.message : String(mimoErr);
        this.logger.error(`❌ Xiaomi MiMo v2.5 también falló: ${msg}`);
      }
    }

    if (!replyText) {
      this.logger.error(
        '🚨 Todos los proveedores de IA configurados fallaron.',
      );
      return 'Lo siento Coach, hubo una sobrecarga momentánea en todos los motores de IA. Por favor intenta tu consulta de nuevo en unos instantes.';
    }

    this.logger.log(
      `✅ Consulta clínica resuelta exitosamente con [${providerUsed}]`,
    );

    // Clean up legacy command tags or stray UUIDs, but preserve [ACCION_RUTINA: ...]
    replyText = replyText
      .replace(/\[COMANDO_RUTINA:[^\]]*\]/gs, '')
      .replace(/\[PROPUESTA_RUTINA:/gi, '[ACCION_RUTINA: {"action": "sustituir_ejercicio", ')
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
  }

  private async callGemini(
    apiKey: string,
    modelName: string,
    systemInstruction: string,
    history: Array<{ role: 'user' | 'model'; content: string }>,
    trainerName: string,
    clientCount: number,
    userMessage: string,
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const contents = [
      { role: 'user' as const, parts: [{ text: systemInstruction }] },
      {
        role: 'model' as const,
        parts: [
          {
            text: `Entendido Coach ${trainerName}. Tengo en memoria el perfil clínico, biomecánico y nutricional de todos tus ${clientCount} atletas. ¿En qué optimizamos el rendimiento hoy?`,
          },
        ],
      },
    ];

    history.forEach((msg) => {
      contents.push({
        role: msg.role === 'model' ? ('model' as const) : ('user' as const),
        parts: [{ text: msg.content }],
      });
    });

    contents.push({
      role: 'user' as const,
      parts: [{ text: userMessage }],
    });

    const generatePromise = model.generateContent({ contents });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout de 6s excedido para ${modelName}`)),
        6000,
      ),
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    return response.response.text();
  }

  private async callMimo(
    systemInstruction: string,
    history: Array<{ role: 'user' | 'model'; content: string }>,
    trainerName: string,
    clientCount: number,
    userMessage: string,
  ): Promise<string> {
    if (!this.mimoApiKey) {
      throw new Error('MIMO_API_KEY no configurada');
    }

    const messages = [
      { role: 'system', content: systemInstruction },
      {
        role: 'assistant',
        content: `Entendido Coach ${trainerName}. Tengo en memoria el perfil clínico, biomecánico y nutricional de todos tus ${clientCount} atletas. ¿En qué optimizamos el rendimiento hoy?`,
      },
      ...history.map((h) => ({
        role: h.role === 'model' ? ('assistant' as const) : ('user' as const),
        content: h.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    const models = ['mimo-v2.5', 'mimo-v2.5-pro', 'mimo-v2-omni'];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        this.logger.log(
          `🤖 Ejecutando consulta clínica con Xiaomi MiMo (${model})...`,
        );
        const response = await fetch(`${this.mimoBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.mimoApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.6,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(
            `Status ${response.status}: ${errText.slice(0, 150)}`,
          );
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error(`Respuesta vacía de MiMo ${model}`);
        }
        return content;
      } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error(String(e));
        lastError = err;
        this.logger.warn(
          `⚠️ Intento con MiMo (${model}) falló: ${err.message}`,
        );
      }
    }

    throw lastError || new Error('Todos los modelos de MiMo fallaron');
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

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO DE CONTROL TOTAL DE RUTINAS — 6 ACCIONES
  // ═══════════════════════════════════════════════════════════════

  async executeRoutineAction(
    trainerId: string,
    payload: Record<string, any>,
  ) {
    const action = payload.action as string;
    const clientName = payload.clientName as string;

    if (!action || !clientName) {
      throw new Error('Faltan datos: "action" y "clientName" son requeridos.');
    }

    // 1. Find athlete
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

    switch (action) {
      case 'sustituir_ejercicio':
        return this.applyRoutineAdjustment(trainerId, {
          clientName,
          oldExercise: payload.currentExercise?.name || '',
          newExercise: payload.proposedExercise?.name || '',
          rationale: payload.rationale,
          routineName: payload.routineName,
        });

      case 'reemplazar_dia':
        return this.actionReplaceDayExercises(trainerId, athlete, payload);

      case 'agregar_ejercicio':
        return this.actionAddExercises(trainerId, athlete, payload);

      case 'eliminar_ejercicio':
        return this.actionRemoveExercises(trainerId, athlete, payload);

      case 'crear_rutina':
        return this.actionCreateRoutine(trainerId, athlete, payload);

      case 'eliminar_rutina':
        return this.actionDeleteRoutine(trainerId, athlete, payload);

      default:
        throw new Error(`Acción no reconocida: "${action}"`);
    }
  }

  // ── Helper: Find active routine for athlete ──
  private async findActiveRoutine(
    athleteId: string,
    routineName?: string,
  ) {
    let routine = await this.prisma.routine.findFirst({
      where: { clientId: athleteId, isActive: true },
      include: {
        routineDays: {
          include: { exercises: { orderBy: { order: 'asc' } } },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!routine && routineName) {
      routine = await this.prisma.routine.findFirst({
        where: {
          clientId: athleteId,
          name: { contains: routineName, mode: 'insensitive' },
        },
        include: {
          routineDays: {
            include: { exercises: { orderBy: { order: 'asc' } } },
            orderBy: { dayNumber: 'asc' },
          },
        },
      });
    }

    return routine;
  }

  // ── Helper: Resolve MuscleGroup safely ──
  private resolveMuscleGroup(value?: string): MuscleGroup {
    const valid = Object.values(MuscleGroup);
    if (value && valid.includes(value as MuscleGroup)) {
      return value as MuscleGroup;
    }
    return MuscleGroup.full_body;
  }

  // ── ACTION: Replace all exercises in a day ──
  private async actionReplaceDayExercises(
    trainerId: string,
    athlete: { id: string; name: string },
    payload: Record<string, any>,
  ) {
    const routine = await this.findActiveRoutine(
      athlete.id,
      payload.routineName,
    );
    if (!routine) {
      throw new Error(
        `${athlete.name} no tiene una rutina activa para modificar.`,
      );
    }

    const dayNumber = payload.dayNumber as number;
    const newFocus = (payload.dayFocus as string) || 'Día Renovado';
    const newExercises = (payload.newExercises || []) as Array<{
      name: string;
      sets?: number;
      reps?: string;
      muscleGroup?: string;
      restSeconds?: number;
      observations?: string;
    }>;

    // Find the day by number or fuzzy focus match
    let targetDay = routine.routineDays.find((d) => d.dayNumber === dayNumber);
    if (!targetDay && payload.dayFocus) {
      targetDay = routine.routineDays.find((d) =>
        d.focusArea.toLowerCase().includes(
          (payload.dayFocus as string).toLowerCase(),
        ),
      );
    }

    if (!targetDay) {
      throw new Error(
        `No se encontró el día ${dayNumber || payload.dayFocus} en la rutina de ${athlete.name}.`,
      );
    }

    const oldExerciseNames = targetDay.exercises.map((e) => e.name);

    // Transaction: delete old exercises, update day focus, create new exercises
    await this.prisma.$transaction([
      this.prisma.exercise.deleteMany({
        where: { routineDayId: targetDay.id },
      }),
      this.prisma.routineDay.update({
        where: { id: targetDay.id },
        data: { focusArea: newFocus },
      }),
      ...newExercises.map((ex, idx) =>
        this.prisma.exercise.create({
          data: {
            routineDayId: targetDay!.id,
            name: ex.name,
            sets: ex.sets || 3,
            reps: ex.reps || '8-12',
            muscleGroup: this.resolveMuscleGroup(ex.muscleGroup),
            restSeconds: ex.restSeconds || 60,
            observations: ex.observations || `[Ajuste Clínico IA: ${payload.rationale || 'Rediseño del día'}]`,
            order: idx + 1,
          },
        }),
      ),
      this.prisma.routine.update({
        where: { id: routine.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    this.logger.log(
      `✅ Día ${targetDay.dayNumber} reemplazado para ${athlete.name}: ${oldExerciseNames.length} ejercicios → ${newExercises.length} ejercicios`,
    );

    return {
      success: true,
      action: 'reemplazar_dia',
      message: `¡Día ${targetDay.dayNumber} (${newFocus}) rediseñado! Se reemplazaron ${oldExerciseNames.length} ejercicios por ${newExercises.length} nuevos en la rutina "${routine.name}" de ${athlete.name}.`,
      clientName: athlete.name,
      routineName: routine.name,
      dayFocus: newFocus,
      oldExercises: oldExerciseNames,
      newExercises: newExercises.map((e) => e.name),
    };
  }

  // ── ACTION: Add exercises to a day ──
  private async actionAddExercises(
    trainerId: string,
    athlete: { id: string; name: string },
    payload: Record<string, any>,
  ) {
    const routine = await this.findActiveRoutine(
      athlete.id,
      payload.routineName,
    );
    if (!routine) {
      throw new Error(
        `${athlete.name} no tiene una rutina activa para modificar.`,
      );
    }

    const exercises = (payload.exercises || []) as Array<{
      name: string;
      sets?: number;
      reps?: string;
      muscleGroup?: string;
      restSeconds?: number;
    }>;

    // Find the target day
    let targetDay = routine.routineDays.find(
      (d) => d.dayNumber === (payload.dayNumber as number),
    );
    if (!targetDay && payload.dayFocus) {
      targetDay = routine.routineDays.find((d) =>
        d.focusArea.toLowerCase().includes(
          (payload.dayFocus as string).toLowerCase(),
        ),
      );
    }
    if (!targetDay) {
      throw new Error(
        `No se encontró el día ${payload.dayNumber || payload.dayFocus} en la rutina de ${athlete.name}.`,
      );
    }

    const maxOrder = targetDay.exercises.reduce(
      (max, ex) => Math.max(max, ex.order),
      0,
    );

    await this.prisma.$transaction([
      ...exercises.map((ex, idx) =>
        this.prisma.exercise.create({
          data: {
            routineDayId: targetDay!.id,
            name: ex.name,
            sets: ex.sets || 3,
            reps: ex.reps || '8-12',
            muscleGroup: this.resolveMuscleGroup(ex.muscleGroup),
            restSeconds: ex.restSeconds || 60,
            observations: `[Agregado por IA: ${payload.rationale || 'Complemento de entrenamiento'}]`,
            order: maxOrder + idx + 1,
          },
        }),
      ),
      this.prisma.routine.update({
        where: { id: routine.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    this.logger.log(
      `✅ ${exercises.length} ejercicio(s) agregados al día ${targetDay.dayNumber} de ${athlete.name}`,
    );

    return {
      success: true,
      action: 'agregar_ejercicio',
      message: `¡${exercises.length} ejercicio(s) agregados al día ${targetDay.dayNumber} (${targetDay.focusArea}) de la rutina "${routine.name}" de ${athlete.name}!`,
      clientName: athlete.name,
      routineName: routine.name,
      dayFocus: targetDay.focusArea,
      addedExercises: exercises.map((e) => e.name),
    };
  }

  // ── ACTION: Remove exercises from a day ──
  private async actionRemoveExercises(
    trainerId: string,
    athlete: { id: string; name: string },
    payload: Record<string, any>,
  ) {
    const routine = await this.findActiveRoutine(
      athlete.id,
      payload.routineName,
    );
    if (!routine) {
      throw new Error(
        `${athlete.name} no tiene una rutina activa para modificar.`,
      );
    }

    const exercisesToRemove = (payload.exercisesToRemove || []) as string[];
    const removed: string[] = [];

    for (const exName of exercisesToRemove) {
      for (const day of routine.routineDays) {
        const match = day.exercises.find((ex) => {
          const exLow = ex.name.toLowerCase();
          const searchLow = exName.toLowerCase();
          return exLow.includes(searchLow) || searchLow.includes(exLow);
        });
        if (match) {
          await this.prisma.exercise.delete({ where: { id: match.id } });
          removed.push(match.name);
          break;
        }
      }
    }

    if (removed.length > 0) {
      await this.prisma.routine.update({
        where: { id: routine.id },
        data: { updatedAt: new Date() },
      });
    }

    this.logger.log(
      `✅ ${removed.length} ejercicio(s) eliminados de la rutina de ${athlete.name}: ${removed.join(', ')}`,
    );

    return {
      success: true,
      action: 'eliminar_ejercicio',
      message: `Se eliminaron ${removed.length} ejercicio(s) de la rutina "${routine.name}" de ${athlete.name}: ${removed.join(', ')}.`,
      clientName: athlete.name,
      routineName: routine.name,
      removedExercises: removed,
    };
  }

  // ── ACTION: Create a brand new routine ──
  private async actionCreateRoutine(
    trainerId: string,
    athlete: { id: string; name: string },
    payload: Record<string, any>,
  ) {
    const routineName =
      (payload.routineName as string) || `Rutina IA - ${athlete.name}`;
    const description = (payload.description as string) || '';
    const weekCount = (payload.weekCount as number) || 4;
    const days = (payload.days || []) as Array<{
      dayNumber: number;
      focusArea: string;
      isRestDay?: boolean;
      restDayNote?: string;
      exercises?: Array<{
        name: string;
        sets?: number;
        reps?: string;
        muscleGroup?: string;
        restSeconds?: number;
      }>;
    }>;

    // Deactivate any currently active routine
    await this.prisma.routine.updateMany({
      where: { clientId: athlete.id, isActive: true },
      data: { isActive: false },
    });

    // Create the full routine with nested days and exercises
    const routine = await this.prisma.routine.create({
      data: {
        name: routineName,
        description,
        trainerId,
        clientId: athlete.id,
        weekCount,
        isActive: true,
        routineDays: {
          create: days.map((day) => ({
            dayNumber: day.dayNumber,
            focusArea: day.focusArea || `Día ${day.dayNumber}`,
            isRestDay: day.isRestDay || false,
            restDayNote: day.restDayNote || null,
            exercises: {
              create: (day.exercises || []).map((ex, idx) => ({
                name: ex.name,
                sets: ex.sets || 3,
                reps: ex.reps || '8-12',
                muscleGroup: this.resolveMuscleGroup(ex.muscleGroup),
                restSeconds: ex.restSeconds || 60,
                observations: `[Creado por IA Clínica]`,
                order: idx + 1,
              })),
            },
          })),
        },
      },
      include: {
        routineDays: { include: { exercises: true } },
      },
    });

    const totalExercises = routine.routineDays.reduce(
      (acc, d) => acc + d.exercises.length,
      0,
    );

    this.logger.log(
      `✅ Rutina "${routineName}" creada para ${athlete.name}: ${routine.routineDays.length} días, ${totalExercises} ejercicios`,
    );

    return {
      success: true,
      action: 'crear_rutina',
      message: `¡Rutina "${routineName}" creada exitosamente para ${athlete.name}! Contiene ${routine.routineDays.length} días y ${totalExercises} ejercicios. La rutina anterior ha sido desactivada.`,
      clientName: athlete.name,
      routineName,
      daysCount: routine.routineDays.length,
      exercisesCount: totalExercises,
    };
  }

  // ── ACTION: Delete (deactivate) a routine ──
  private async actionDeleteRoutine(
    trainerId: string,
    athlete: { id: string; name: string },
    payload: Record<string, any>,
  ) {
    const routine = await this.findActiveRoutine(
      athlete.id,
      payload.routineName,
    );
    if (!routine) {
      throw new Error(
        `${athlete.name} no tiene una rutina activa para eliminar.`,
      );
    }

    await this.prisma.routine.update({
      where: { id: routine.id },
      data: { isActive: false },
    });

    this.logger.log(
      `✅ Rutina "${routine.name}" desactivada para ${athlete.name} por entrenador ${trainerId}`,
    );

    return {
      success: true,
      action: 'eliminar_rutina',
      message: `La rutina "${routine.name}" de ${athlete.name} ha sido desactivada. Los datos no se han borrado permanentemente por seguridad.`,
      clientName: athlete.name,
      routineName: routine.name,
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
