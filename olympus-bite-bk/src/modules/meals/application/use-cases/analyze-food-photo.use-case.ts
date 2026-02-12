import { Inject, Injectable } from '@nestjs/common';
import {
  FOOD_RECOGNITION_SERVICE,
  FoodRecognitionPort,
  FoodAnalysisResult,
} from '../../domain/ports/food-recognition.port';

@Injectable()
export class AnalyzeFoodPhotoUseCase {
  constructor(
    @Inject(FOOD_RECOGNITION_SERVICE)
    private readonly foodRecognition: FoodRecognitionPort,
  ) {}

  async execute(imageBase64: string, goal?: string): Promise<FoodAnalysisResult> {
    return this.foodRecognition.analyzeImage(imageBase64, goal);
  }
}
