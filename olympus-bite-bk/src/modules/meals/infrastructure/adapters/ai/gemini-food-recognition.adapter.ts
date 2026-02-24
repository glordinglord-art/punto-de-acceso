import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  FoodRecognitionPort,
  FoodAnalysisResult,
  FoodRecognitionContext,
} from '../../../domain/ports/food-recognition.port';
import { NutritionalInfo } from '../../../domain/value-objects/nutritional-info.vo';

/**
 * Adaptador de reconocimiento de alimentos usando Google Gemini Flash.
 * Tier gratuito: 15 req/min, 1500 req/día.
 * Obtener API key en: https://aistudio.google.com/apikey
 */
@Injectable()
export class GeminiFoodRecognitionAdapter
  implements FoodRecognitionPort, OnModuleInit
{
  private readonly logger = new Logger(GeminiFoodRecognitionAdapter.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null =
    null;

  // Modelos a intentar en orden (por si uno agota cuota)
  private static readonly MODELS = [
    'gemini-2.5-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
  ];

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        '⚠️  GEMINI_API_KEY no configurada. El análisis de fotos usará datos estimados.',
      );
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.logger.log('✅ Gemini 2.5 Flash conectado para análisis de alimentos');
  }

  async analyzeImages(
    imagesBase64: string[],
    context?: FoodRecognitionContext,
  ): Promise<FoodAnalysisResult> {
    if (!this.genAI || !imagesBase64.length) {
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

    const imageParts = imagesBase64.map((base64) => {
      const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      let mimeType = 'image/jpeg';
      if (base64.startsWith('data:image/png')) {
        mimeType = 'image/png';
      } else if (base64.startsWith('data:image/webp')) {
        mimeType = 'image/webp';
      }
      return { inlineData: { mimeType, data: cleanBase64 } };
    });

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

    // Intentar con cada modelo disponible
    for (const modelName of GeminiFoodRecognitionAdapter.MODELS) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        this.logger.log(`Intentando análisis con ${modelName}...`);

        const result = await model.generateContent([prompt, ...imageParts]);
        const text = result.response.text();

        // Extraer JSON de la respuesta
        const jsonMatch =
          text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
          text.match(/(\{[\s\S]*\})/);

        if (!jsonMatch) {
          this.logger.warn(
            `${modelName} no devolvió JSON válido, probando siguiente modelo`,
          );
          continue;
        }

        const parsed = JSON.parse(jsonMatch[1].trim());

        this.logger.log(
          `✅ Análisis exitoso con ${modelName}: ${parsed.description}`,
        );

        const validRatings = ['excelente', 'buena', 'regular', 'mala'] as const;
        const parsedRating = validRatings.includes(parsed.goalRating)
          ? parsed.goalRating
          : 'buena';

        return {
          foods: parsed.foods || ['Alimento no identificado'],
          description:
            parsed.description ||
            'Comida analizada por inteligencia artificial',
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
        const msg = String(error?.message || error || '');
        this.logger.warn(`${modelName} falló: ${msg.slice(0, 200)}`);
        // Siempre intentar el siguiente modelo
        continue;
      }
    }

    this.logger.error('Todos los modelos de Gemini fallaron, usando fallback');
    return this.getFallbackResult();
  }

  private getFallbackResult(): FoodAnalysisResult {
    return {
      foods: ['Comida no identificada'],
      description:
        'No se pudo analizar la imagen. Puedes ingresar los datos manualmente.',
      nutritionalInfo: new NutritionalInfo({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
      }),
      confidence: 0,
      recommendation:
        'No se pudo generar una recomendación. Ingresa los datos manualmente.',
      goalRating: 'buena',
    };
  }
}
