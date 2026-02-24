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

  async execute(dto: any): Promise<FoodAnalysisResult> {
    const { imagesBase64, ...context } = dto;
    return this.foodRecognition.analyzeImages(imagesBase64, context);
  }
}
