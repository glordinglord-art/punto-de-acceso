import { Injectable } from '@nestjs/common';
import {
  FoodRecognitionPort,
  FoodAnalysisResult,
  FoodRecognitionContext,
} from '../../../domain/ports/food-recognition.port';
import { NutritionalInfo } from '../../../domain/value-objects/nutritional-info.vo';

/**
 * Adaptador mock para reconocimiento de alimentos.
 * En producción, aquí se conectaría con OpenAI Vision, Google Cloud Vision,
 * o cualquier API de reconocimiento de alimentos.
 */
@Injectable()
export class MockFoodRecognitionAdapter implements FoodRecognitionPort {
  async analyzeImages(
    _imagesBase64: string[],
    _context?: FoodRecognitionContext,
  ): Promise<FoodAnalysisResult> {
    // Simulación - en producción integrar con IA real
    const mockFoods: FoodAnalysisResult[] = [
      {
        foods: [
          'Pechuga de pollo a la plancha',
          'Arroz integral',
          'Ensalada mixta',
        ],
        description:
          'Plato balanceado de proteína magra con carbohidratos complejos y vegetales frescos',
        nutritionalInfo: new NutritionalInfo({
          calories: 450,
          protein: 38,
          carbs: 42,
          fat: 12,
          fiber: 6,
          sugar: 3,
        }),
        confidence: 0.87,
        recommendation:
          'Excelente elección. Alto en proteína y bajo en grasa, ideal para cualquier objetivo fitness.',
        goalRating: 'excelente',
      },
      {
        foods: ['Avena con frutas', 'Banana', 'Miel', 'Almendras'],
        description:
          'Bowl de avena con frutas frescas, ideal para desayuno energético',
        nutritionalInfo: new NutritionalInfo({
          calories: 380,
          protein: 12,
          carbs: 58,
          fat: 14,
          fiber: 8,
          sugar: 22,
        }),
        confidence: 0.92,
        recommendation:
          'Buen desayuno energético. Considera añadir más proteína si buscas ganancia muscular.',
        goalRating: 'buena',
      },
      {
        foods: ['Salmón al horno', 'Brócoli al vapor', 'Batata asada'],
        description:
          'Plato rico en omega-3 con vegetales y carbohidratos de índice glucémico bajo',
        nutritionalInfo: new NutritionalInfo({
          calories: 520,
          protein: 34,
          carbs: 38,
          fat: 22,
          fiber: 7,
          sugar: 8,
        }),
        confidence: 0.85,
        recommendation:
          'Plato excelente rico en omega-3. El salmón y la batata aportan nutrientes esenciales.',
        goalRating: 'excelente',
      },
    ];

    const random = mockFoods[Math.floor(Math.random() * mockFoods.length)];
    return random;
  }
}
