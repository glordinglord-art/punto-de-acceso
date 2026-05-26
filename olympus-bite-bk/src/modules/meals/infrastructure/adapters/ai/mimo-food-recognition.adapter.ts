import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  FoodRecognitionPort,
  FoodAnalysisResult,
  FoodRecognitionContext,
} from '../../../domain/ports/food-recognition.port';
import { NutritionalInfo } from '../../../domain/value-objects/nutritional-info.vo';

/**
 * Adaptador de reconocimiento de alimentos usando Xiaomi MiMo AI.
 * Compatible con la API de OpenAI.
 */
@Injectable()
export class MimoFoodRecognitionAdapter
  implements FoodRecognitionPort, OnModuleInit
{
  private readonly logger = new Logger(MimoFoodRecognitionAdapter.name);
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.xiaomimimo.com/v1';

  // Modelos a intentar en orden de preferencia
  private static readonly MODELS = ['mimo-v2.5', 'mimo-v2-omni'];

  onModuleInit() {
    this.apiKey = process.env.MIMO_API_KEY || null;
    if (process.env.MIMO_BASE_URL) {
      this.baseUrl = process.env.MIMO_BASE_URL;
    }

    if (!this.apiKey) {
      this.logger.warn(
        '⚠️ MIMO_API_KEY no configurada. El adaptador MiMo no estará disponible.',
      );
      return;
    }
    this.logger.log('✅ Xiaomi MiMo Adapter inicializado correctamente');
  }

  async analyzeImages(
    imagesBase64: string[],
    context?: FoodRecognitionContext,
  ): Promise<FoodAnalysisResult> {
    if (!this.apiKey || !imagesBase64.length) {
      return this.getFallbackResult();
    }

    const {
      goal,
      description,
      weight,
      height,
      experienceLevel,
      medicalConditions,
      dietaryPreferences,
    } = context || {};

    const goalLabels: Record<string, string> = {
      deficit: 'Déficit calórico (pérdida de grasa)',
      volumen: 'Volumen/Bulk (ganancia muscular)',
      mantenimiento: 'Mantenimiento de peso',
      recomposicion: 'Recomposición corporal',
    };

    const goalDescription = goal ? goalLabels[goal] || goal : 'No especificado';

    let userContextString = '';
    if (description)
      userContextString += `\n- Descripción dada por el usuario: "${description}"`;
    if (weight) userContextString += `\n- Peso: ${weight} kg`;
    if (height) userContextString += `\n- Estatura: ${height} cm`;
    if (experienceLevel)
      userContextString += `\n- Experiencia en entrenamiento: ${experienceLevel}`;
    if (medicalConditions)
      userContextString += `\n- Condiciones médicas o lesiones: ${medicalConditions}`;
    if (dietaryPreferences)
      userContextString += `\n- Preferencias alimentarias o alergias: ${dietaryPreferences}`;

    const prompt = `Eres un nutricionista deportivo experto. Analiza esta(s) imagen(es) de comida y devuelve EXACTAMENTE un JSON con esta estructura, sin texto adicional, sin markdown, solo el JSON puro:
{
  "foods": ["nombre de cada alimento visible en todas las fotos"],
  "description": "descripción breve del plato en español",
  "calories": número estimado de calorías totales,
  "protein": gramos de proteína,
  "carbs": gramos de carbohidratos,
  "fat": gramos de grasa,
  "fiber": gramos de fibra,
  "sugar": gramos de azúcar,
  "confidence": número entre 0 y 1 indicando tu confianza en el análisis,
  "recommendation": "recomendación detallada y personalizada en español sobre esta comida",
  "goalRating": "excelente|buena|regular|mala"
}

OBJETIVO FITNESS DEL USUARIO: ${goalDescription}
PERFIL DEL USUARIO:${userContextString || '\n- Datos no proporcionados'}

INSTRUCCIONES PARA la recomendación:
- Usa el PERFIL DEL USUARIO y su OBJETIVO FITNESS para hacer la evaluación más precisa.
- Evalúa si la comida es apropiada para el objetivo del usuario considerando su peso y estatura si están disponibles.
- TOMA MUY EN CUENTA sus "Condiciones médicas" o "Preferencias alimentarias / alergias" (ej. si es alérgico a algo en la foto, ADVIÉRTE).
- Si es DÉFICIT: evalúa si las calorías son adecuadas, si tiene suficiente proteína para preservar músculo.
- Si es VOLUMEN: evalúa si tiene suficientes calorías y proteína para crecimiento muscular.
- Da consejos prácticos y específicos (ej: "podrías añadir...", "considera reducir...", "excelente elección porque...").
- Mantén la recomendación en 3-4 oraciones concisas.

INSTRUCCIONES PARA goalRating:
- "excelente": la comida es perfecta para el objetivo y perfil.
- "buena": la comida es adecuada con pequeñas mejoras posibles.
- "regular": la comida tiene aspectos positivos pero necesita ajustes importantes.
- "mala": la comida no es apropiada para el objetivo o perfil actual (especialmente si incluye alérgenos).

Sé lo más preciso posible con los valores nutricionales. Si no puedes identificar la comida con certeza, estima los valores lo mejor que puedas y pon un confidence bajo. Los nombres de los alimentos deben estar en español.`;

    const formattedImages = imagesBase64.map((base64) => {
      const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      let mimeType = 'image/jpeg';
      if (base64.startsWith('data:image/png')) {
        mimeType = 'image/png';
      } else if (base64.startsWith('data:image/webp')) {
        mimeType = 'image/webp';
      }
      return {
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${cleanBase64}`,
        },
      };
    });

    // Intentar con cada modelo de MiMo
    for (const modelName of MimoFoodRecognitionAdapter.MODELS) {
      try {
        this.logger.log(`Intentando análisis con MiMo modelo: ${modelName}...`);

        const requestBody = {
          model: modelName,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                ...formattedImages,
              ],
            },
          ],
        };

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(
            `Status ${response.status}: ${errText.slice(0, 200)}`,
          );
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;

        if (!text) {
          throw new Error('Respuesta vacía del API de Xiaomi MiMo');
        }

        // Extraer JSON de la respuesta
        const jsonMatch =
          text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
          text.match(/(\{[\s\S]*\})/);

        if (!jsonMatch) {
          throw new Error(
            'No se pudo encontrar un JSON válido en la respuesta',
          );
        }

        const parsed = JSON.parse(jsonMatch[1].trim());

        this.logger.log(
          `✅ Análisis exitoso con Xiaomi MiMo (${modelName}): ${parsed.description}`,
        );

        const validRatings = ['excelente', 'buena', 'regular', 'mala'] as const;
        const parsedRating = validRatings.includes(parsed.goalRating)
          ? parsed.goalRating
          : 'buena';

        return {
          foods: parsed.foods || ['Alimento no identificado'],
          description:
            parsed.description ||
            'Comida analizada por inteligencia artificial (MiMo)',
          nutritionalInfo: new NutritionalInfo({
            calories: Math.round(parsed.calories || 0),
            protein: Math.round(parsed.protein || 0),
            carbs: Math.round(parsed.carbs || 0),
            fat: Math.round(parsed.fat || 0),
            fiber: Math.round(parsed.fiber || 0),
            sugar: Math.round(parsed.sugar || 0),
          }),
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
          recommendation:
            parsed.recommendation || 'No se pudo generar una recomendación.',
          goalRating: parsedRating,
        };
      } catch (error: any) {
        this.logger.warn(
          `MiMo (${modelName}) falló: ${error?.message || error}`,
        );
        // Continuar al siguiente modelo en caso de fallo
        continue;
      }
    }

    throw new Error('Todos los modelos de Xiaomi MiMo fallaron');
  }

  private getFallbackResult(): FoodAnalysisResult {
    return {
      foods: ['Comida no identificada (MiMo Fallback)'],
      description:
        'No se pudo analizar la imagen con MiMo. Puedes ingresar los datos manualmente.',
      nutritionalInfo: new NutritionalInfo({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
      }),
      confidence: 0,
      recommendation: 'No se pudo generar una recomendación con MiMo.',
      goalRating: 'buena',
    };
  }
}
