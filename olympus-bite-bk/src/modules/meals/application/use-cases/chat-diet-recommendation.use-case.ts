import { Inject, Injectable } from '@nestjs/common';
import {
  DIET_RECOMMENDER_SERVICE,
  DietRecommenderPort,
  DietRecommenderContext,
} from '../../domain/ports/diet-recommender.port';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DietRecommenderContextDto implements DietRecommenderContext {
  @IsOptional() @IsString() goal?: string;
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsNumber() height?: number;
  @IsOptional() @IsString() experienceLevel?: string;
  @IsOptional() @IsString() equipmentAccess?: string;
  @IsOptional() @IsString() medicalConditions?: string;
  @IsOptional() @IsString() dietaryPreferences?: string;
  @IsOptional() @IsNumber() targetCalories?: number;
}

export class ChatDietRecommendationDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DietRecommenderContextDto)
  context?: DietRecommenderContextDto;
}

@Injectable()
export class ChatDietRecommendationUseCase {
  constructor(
    @Inject(DIET_RECOMMENDER_SERVICE)
    private readonly recommenderService: DietRecommenderPort,
  ) {}

  async execute(dto: ChatDietRecommendationDto): Promise<string> {
    return this.recommenderService.generateRecommendation(
      dto.prompt,
      dto.context,
    );
  }
}
