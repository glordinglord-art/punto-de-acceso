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
      userContextString += `\n- ÚLTIMAS COMIDAS QUE EL CLIENTE REGISTRÓ (Tómalo en cuenta para no repetir o evaluar qué falta):\n`;
      recentMeals.forEach((m) => {
        userContextString += `  • ${m.date} - ${m.name} (${m.type}): ${m.calories} kcal [${m.macros}]\n`;
      });
    }

    if (activeRoutine) {
      userContextString += `\n- RUTINA DE ENTRENAMIENTO ACTIVA DEL USUARIO:\n  Nombre de la rutina: ${activeRoutine.name}\n  Descripción: ${activeRoutine.description || 'Sin descripción'}\n  Días configurados:\n`;
      activeRoutine.days.forEach((d: any) => {
        const restText = d.isRestDay ? ' (Día de descanso)' : '';
        userContextString += `    • Día ${d.dayNumber}: ${d.focusArea}${restText}\n`;
        if (d.exercises && d.exercises.length > 0) {
          d.exercises.forEach((ex: any) => {
            userContextString += `      - ${ex.name}: ${ex.sets}x${ex.reps} (Notas: ${ex.observations || 'Ninguna'})\n`;
          });
        }
      });
    }

    const systemInstruction = `
Eres un asistente experto en nutrición y fitness de clase mundial, conversando directamente con tu usuario (el cliente).
Tu objetivo es ayudarlo a lograr sus metas de salud basándote en su contexto (calorías, comidas previas, alergias, peso, y su rutina de entrenamiento activa).
Habla de forma directa, motivadora, empática y en primera persona. NO hables de un "cliente" ni menciones a un "entrenador". Tú estás hablando interactiva y directamente con la persona.
Devuelve tu respuesta SOLAMENTE en Markdown estructurado y amigable, usando listas, negritas y emojis relevantes. Si el usuario te pregunta por su rutina, qué comer según su día de entrenamiento o su historial, responde con inteligencia usando todo el contexto provisto.
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
