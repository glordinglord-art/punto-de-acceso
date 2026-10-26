import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  DietRecommenderPort,
  DietRecommenderContext,
} from '../../../domain/ports/diet-recommender.port';

@Injectable()
export class GeminiDietRecommenderAdapter
  implements DietRecommenderPort, OnModuleInit
{
  private readonly logger = new Logger(GeminiDietRecommenderAdapter.name);
  private geminiKeys: string[] = [];
  private mimoApiKey: string | null = null;
  private mimoBaseUrl = 'https://api.xiaomimimo.com/v1';

  private getModelsForKey(key: string): string[] {
    if (key.startsWith('AQ.')) {
      return [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.6-flash',
        'gemini-3.7-flash',
        'gemini-3.5-flash',
      ];
    } else {
      return [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.6-flash',
        'gemini-3.7-flash',
        'gemini-3.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash',
      ];
    }
  }

  onModuleInit() {
    const keys: string[] = [];
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
      `🥗 Pool de IA para Nutrición inicializado: ${this.geminiKeys.length} clave(s) Gemini + ${this.mimoApiKey ? 'Xiaomi MiMo v2.5' : 'Sin MiMo'}`,
    );
  }

  async generateRecommendation(
    promptStr: string,
    context?: DietRecommenderContext,
  ): Promise<string> {
    if (this.geminiKeys.length === 0 && !this.mimoApiKey) {
      throw new Error(
        'El servicio de IA no está configurado (falta API Key de Gemini y MiMo)',
      );
    }

    const {
      goal,
      weight,
      height,
      experienceLevel,
      medicalConditions,
      dietaryPreferences,
      targetCalories,
      ecosystemSummary,
      recentMeals,
      activeRoutine,
      history = [],
    } = context || {};

    const goalLabels: Record<string, string> = {
      deficit: 'Déficit calórico (pérdida de grasa)',
      volumen: 'Volumen/Bulk (ganancia muscular)',
      mantenimiento: 'Mantenimiento de peso',
      recomposicion: 'Recomposición corporal',
    };

    const goalDescription = goal ? goalLabels[goal] || goal : 'No especificado';

    let userContextString = '';
    if (ecosystemSummary)
      userContextString += `\n- ESTADO DE LOS 3 PILARES Y 4 METAS DE 120 DÍAS: ${ecosystemSummary}`;
    if (targetCalories)
      userContextString += `\n- Calorías Diarias Objetivo: ${targetCalories} kcal`;
    if (goal) userContextString += `\n- Objetivo: ${goalDescription}`;
    if (weight) userContextString += `\n- Peso: ${weight} kg`;
    if (height) userContextString += `\n- Estatura: ${height} cm`;
    if (experienceLevel)
      userContextString += `\n- Experiencia en entrenamiento: ${experienceLevel}`;
    if (medicalConditions)
      userContextString += `\n- Condiciones médicas o lesiones: ${medicalConditions}`;
    if (dietaryPreferences)
      userContextString += `\n- Preferencias alimentarias o alergias: ${dietaryPreferences}`;

    if (recentMeals && recentMeals.length > 0) {
      userContextString += `\n- ÚLTIMAS COMIDAS QUE EL ATLETA REGISTRÓ (Tómalo en cuenta para evaluar qué le falta hoy):\n`;
      recentMeals.forEach((m) => {
        userContextString += `  • ${m.date} - ${m.name} (${m.type}): ${m.calories} kcal [${m.macros}]\n`;
      });
    }

    if (activeRoutine) {
      userContextString += `\n- RUTINA DE ENTRENAMIENTO ACTIVA Y VOLUMEN SEMANAL:\n  Nombre: ${activeRoutine.name}\n  Volumen Semanal por Grupo Muscular (MEV-MAV-MRV): ${activeRoutine.volumeSummary || 'En cálculo'}\n  Descripción: ${activeRoutine.description || 'Sin descripción'}\n  Días configurados:\n`;
      activeRoutine.days.forEach((d: any) => {
        const restText = d.isRestDay ? ' (Día de descanso)' : '';
        userContextString += `    • Día ${d.dayNumber}: ${d.focusArea}${restText}\n`;
        if (d.exercises && d.exercises.length > 0) {
          d.exercises.forEach((ex: any) => {
            userContextString += `      - ${ex.name} [${ex.muscleGroup || d.focusArea}]: ${ex.sets}x${ex.reps}${ex.targetWeight ? ` @${ex.targetWeight}kg` : ''} (Notas: ${ex.observations || 'Ninguna'})\n`;
          });
        }
      });
    }

    const systemInstruction = `
Eres el CO-PILOTO DE 120 DÍAS Y ASISTENTE INTEGRAL IA de Punto de Inflexión (Vital Fit), conversando con el ATLETA (o con su Entrenador desde su Ficha Técnica).
Tu responsabilidad es guiar al atleta a lograr sus 4 Metas de 120 Días (1. Biométrica: +0.25kg/sem en subida limpia o -0.50kg/sem en definición; 2. Fuerza; 3. Dominio Corporal; 4. Aeróbica) cuidando los 3 Pilares diarios:
1. ENTRENAMIENTO Y GESTIÓN DEL VOLUMEN:
   - Explicar en lenguaje sencillo el porqué de cada ciclo y de cada sesión.
   - Vigilar que cada músculo reciba su dosis óptima de trabajo semanal (Zona Óptima MAV: 10 a 20 series efectivas por semana; Mínimo MEV: 6–9 series; máximo 8–10 series de un mismo músculo por sesión para evitar "volumen basura").
   - Respetar el orden híbrido: 1º Dominio Corporal (fresco, lejos del fallo) ➔ 2º Fuerza Pesada ➔ 3º Hipertrofia ➔ 4º Aeróbico.
2. AGUA Y COMIDAS:
   - Dar prioridad número 1 a los litros de agua del día (35 ml/kg + 0.5 L por hora de entreno).
   - Explicar por qué come lo que come (proteína para reparar músculo y tendones, carbohidratos para rendir en la sesión, grasas para hormonas).
3. DESCANSO Y REGULARIDAD (±1 HORA):
   - Recordar que lo más importante es dormir 7 a 8 horas acostándose y levantándose todos los días a la misma hora (margen máximo de ±1 hora).

PERMISOS EJECUTORES EN TODO EL ECOSISTEMA (COMANDOS OCULTOS AL FINAL):
Si te piden EXPLÍCITAMENTE registrar o modificar comidas, agua, sueño, peso en ayunas o ajustar un ejercicio/carga de la rutina, añade al final de tu respuesta la etiqueta exacta:
- Registrar una comida nueva:
  [ACCION_COMIDA: {"action": "create_meal", "name": "Nombre del plato", "mealType": "breakfast|lunch|dinner|snack", "calories": 520, "protein": 42, "carbs": 50, "fat": 16}]
- Modificar la última comida registrada:
  [ACCION_COMIDA: {"action": "update_last_meal", "name": "Nombre corregido", "calories": 450, "protein": 38, "carbs": 40, "fat": 14}]
- Eliminar la última comida registrada:
  [ACCION_COMIDA: {"action": "delete_last_meal"}]
- Registrar litros de agua de hoy:
  [ACCION_COMIDA: {"action": "log_water", "liters": 2.5}]
- Registrar horas y horario de sueño de hoy:
  [ACCION_COMIDA: {"action": "log_sleep", "hoursSlept": 7.5, "bedtime": "22:30", "wakeTime": "06:00", "withinOneHourWindow": true}]
- Registrar peso semanal en ayunas (en kg o lbs):
  [ACCION_COMIDA: {"action": "log_weighin", "weight": 75.5, "unit": "kg"}]
- Ajustar peso, series o repeticiones de un ejercicio en su rutina (en kg o lbs, sin reiniciar el progreso):
  [ACCION_COMIDA: {"action": "update_load", "exerciseName": "Sentadilla", "sets": 4, "reps": "6-8", "targetWeight": 85, "unit": "kg"}]
- Cambiar un ejercicio por otro en su rutina activa:
  [ACCION_COMIDA: {"action": "replace_exercise", "oldExercise": "Press banca", "newExercise": "Press con mancuernas"}]
En conversaciones normales donde no te pidan guardar o modificar un dato, NUNCA emitas la etiqueta [ACCION_COMIDA].

Usa siempre un lenguaje cercano, muy fácil de entender, sin tecnicismos confusos y cómodo de leer en celular.
    `;

    const mappedHistory = history.map((msg) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // 1. Cascada Multi-Modelo por todas las llaves de Gemini
    for (let k = 0; k < this.geminiKeys.length; k++) {
      const key = this.geminiKeys[k];
      const keyShort = `...${key.slice(-4)}`;
      const targetModels = this.getModelsForKey(key);

      for (const modelName of targetModels) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({ model: modelName });
          const chat = model.startChat({
            history: [
              {
                role: 'user',
                parts: [
                  {
                    text:
                      systemInstruction +
                      '\n\n' +
                      'CONTEXTO NUTRICIONAL DEL USUARIO:\n' +
                      (userContextString
                        ? userContextString
                        : 'Ningún dato específico configurado.'),
                  },
                ],
              },
              {
                role: 'model',
                parts: [
                  {
                    text: 'Entendido. Estoy listo para platicar directamente contigo, entender tu cuerpo y ayudarte a alcanzar tus objetivos nutricionales usando toda mi sabiduría. ¡Hablemos! 🥦✨',
                  },
                ],
              },
              ...mappedHistory,
            ],
          });

          const generatePromise = chat.sendMessage(promptStr);
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout de 6s en ${modelName}`)),
              6000,
            ),
          );

          const result = await Promise.race([generatePromise, timeoutPromise]);

          const reply = result.response.text();
          if (reply) {
            this.logger.log(
              `✅ Recomendación dietética generada exitosamente con [${modelName}] (Clave #${k + 1} ${keyShort})`,
            );
            return reply;
          }
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : String(e);
          this.logger.warn(
            `⚠️ [${modelName}] en Clave #${k + 1} (${keyShort}) falló (${errMsg.slice(0, 80)}). Conmutando...`,
          );
        }
      }
    }

    // Failover a Xiaomi MiMo v2.5
    if (this.mimoApiKey) {
      try {
        const messages = [
          {
            role: 'system',
            content:
              systemInstruction +
              '\n\nCONTEXTO NUTRICIONAL DEL USUARIO:\n' +
              (userContextString || 'Ningún dato específico configurado.'),
          },
          ...history.map((h) => ({
            role: h.role === 'ai' ? ('assistant' as const) : ('user' as const),
            content: h.content,
          })),
          { role: 'user' as const, content: promptStr },
        ];

        const response = await fetch(`${this.mimoBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.mimoApiKey}`,
          },
          body: JSON.stringify({
            model: 'mimo-v2.5',
            messages,
            temperature: 0.6,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            this.logger.log(
              '✅ Recomendación dietética generada exitosamente con Xiaomi MiMo v2.5',
            );
            return content;
          }
        }
      } catch (mimoErr) {
        this.logger.error(
          '❌ Xiaomi MiMo también falló para recomendación dietética:',
          mimoErr,
        );
      }
    }

    throw new Error(
      'No se pudo generar la recomendación en este momento (motores de IA ocupados).',
    );
  }
}
