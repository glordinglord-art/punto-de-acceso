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

    const systemInstruction = `
Eres un nutricionista deportivo de clase mundial ayudando a un entrenador personal a planificar la dieta de su cliente.
Usa los datos del cliente para dar respuestas sumamente precisas y profesionales.
Devuelve la respuesta SOLAMENTE en Markdown estructurado y amigable de leer, usando listas, negritas y emojis relevantes. No devuelvas formato JSON, sino texto narrativo directo. Si el entrenador dice que quiere "4000 calorias", diseña algo para 4000 calorias.
    `;

    const finalPrompt = `
${systemInstruction}

CONTEXTO DEL CLIENTE:
${userContextString ? userContextString : 'Ningún dato específico configurado.'}

PETICIÓN DEL ENTRENADOR:
"${promptStr}"
    `;

    try {
      const result = await this.model.generateContent(finalPrompt);
      const output = result.response.text();
      return output;
    } catch (e) {
      this.logger.error('Error generando recomendación:', e);
      throw new Error('No se pudo generar la recomendación en este momento.');
    }
  }
}
