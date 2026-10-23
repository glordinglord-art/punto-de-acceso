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
  private genAI: GoogleGenerativeAI | null = null;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null =
    null;

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        '⚠️ GEMINI_API_KEY no configurada. El recomendador de dietas fallará.',
      );
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.logger.log(
      '✅ Gemini 2.5 Flash conectado para recomendaciones de dieta',
    );
  }

  async generateRecommendation(
    promptStr: string,
    context?: DietRecommenderContext,
  ): Promise<string> {
    if (!this.genAI || !this.model) {
      throw new Error('El servicio de IA no está configurado (falta API Key)');
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

    try {
      const chat = this.model.startChat({
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

      const result = await chat.sendMessage(promptStr);
      const output = result.response.text();
      return output;
    } catch (e) {
      this.logger.error('Error generando recomendación con historial:', e);
      throw new Error('No se pudo generar la recomendación en este momento.');
    }
  }
}
