import { NutritionalInfo } from '../../domain/value-objects/nutritional-info.vo';

export const FOOD_RECOGNITION_SERVICE = Symbol('FOOD_RECOGNITION_SERVICE');

export interface FoodAnalysisResult {
  foods: string[];
  description: string;
  nutritionalInfo: NutritionalInfo;
  confidence: number;
  recommendation: string;
  goalRating: 'excelente' | 'buena' | 'regular' | 'mala';
}

export interface FoodRecognitionContext {
  goal?: string;
  description?: string;
  weight?: number;
  height?: number;
  experienceLevel?: string;
  equipmentAccess?: string;
  medicalConditions?: string;
  dietaryPreferences?: string;
}

export interface FoodRecognitionPort {
  analyzeImages(
    imagesBase64: string[],
    context?: FoodRecognitionContext,
  ): Promise<FoodAnalysisResult>;
}
