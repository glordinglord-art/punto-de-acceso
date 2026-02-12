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

export interface FoodRecognitionPort {
  analyzeImage(imageBase64: string, goal?: string): Promise<FoodAnalysisResult>;
}
