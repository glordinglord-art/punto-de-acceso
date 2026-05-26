import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  FoodRecognitionPort,
  FoodAnalysisResult,
  FoodRecognitionContext,
} from '../../../domain/ports/food-recognition.port';
import { GeminiFoodRecognitionAdapter } from './gemini-food-recognition.adapter';
import { MimoFoodRecognitionAdapter } from './mimo-food-recognition.adapter';
import { NutritionalInfo } from '../../../domain/value-objects/nutritional-info.vo';

@Injectable()
export class HybridFoodRecognitionAdapter
  implements FoodRecognitionPort, OnModuleInit
{
  private readonly logger = new Logger(HybridFoodRecognitionAdapter.name);
  private primaryProvider: string = 'gemini';

  constructor(
    private readonly geminiAdapter: GeminiFoodRecognitionAdapter,
    private readonly mimoAdapter: MimoFoodRecognitionAdapter,
  ) {}

  onModuleInit() {
    const provider = process.env.PRIMARY_FOOD_RECOGNITION_PROVIDER || 'gemini';
    if (provider === 'gemini' || provider === 'mimo') {
      this.primaryProvider = provider;
    }
    this.logger.log(
      `🔄 HybridFoodRecognition inicializado. Primario: ${this.primaryProvider === 'gemini' ? 'Gemini' : 'MiMo'} | Respaldo: ${this.primaryProvider === 'gemini' ? 'MiMo' : 'Gemini'}`,
    );
  }

  async analyzeImages(
    imagesBase64: string[],
    context?: FoodRecognitionContext,
  ): Promise<FoodAnalysisResult> {
    const isGeminiPrimary = this.primaryProvider === 'gemini';
    const primary = isGeminiPrimary ? this.geminiAdapter : this.mimoAdapter;
    const secondary = isGeminiPrimary ? this.mimoAdapter : this.geminiAdapter;
    const primaryName = isGeminiPrimary ? 'Gemini' : 'MiMo';
    const secondaryName = isGeminiPrimary ? 'MiMo' : 'Gemini';

    // --- Intento 1: Proveedor primario ---
    try {
      this.logger.log(
        `[Intento 1/2] Analizando con ${primaryName} (Primario)...`,
      );
      const result = await primary.analyzeImages(imagesBase64, context);

      if (result.confidence > 0) {
        this.logger.log(`✅ Análisis exitoso con ${primaryName}`);
        return result;
      }

      this.logger.warn(
        `⚠️ ${primaryName} retornó confianza 0. Intentando respaldo...`,
      );
    } catch (error: any) {
      this.logger.warn(`❌ ${primaryName} falló: ${error?.message || error}`);
    }

    // --- Intento 2: Proveedor de respaldo ---
    try {
      this.logger.log(
        `[Intento 2/2] Analizando con ${secondaryName} (Respaldo)...`,
      );
      const result = await secondary.analyzeImages(imagesBase64, context);

      if (result.confidence > 0) {
        this.logger.log(`✅ Respaldo exitoso con ${secondaryName}`);
        return result;
      }
    } catch (secError: any) {
      this.logger.error(
        `❌ ${secondaryName} también falló: ${secError?.message || secError}`,
      );
    }

    this.logger.error(
      '🚨 Ambos proveedores (Gemini y MiMo) fallaron. Usando datos fallback.',
    );
    return this.getFallbackResult();
  }

  private getFallbackResult(): FoodAnalysisResult {
    return {
      foods: ['Comida no identificada'],
      description:
        'No se pudieron utilizar los proveedores de IA para analizar la imagen. Puedes ingresar los datos manualmente.',
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
