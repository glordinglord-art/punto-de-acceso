import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class OnboardingSubmissionDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  purposes?: string[];

  @IsOptional()
  @IsNumber()
  targetWeight?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditionsList?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  performanceAspects?: string[];

  @IsOptional()
  @IsString()
  bodyFatPercentage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  physicalActivityTypes?: string[];

  @IsOptional()
  @IsString()
  strengthFrequency?: string;

  @IsOptional()
  @IsNumber()
  sessionDurationMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodPreferences?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergiesAndIntolerances?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lifestyleHabits?: string[];

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  intermittentFasting?: string;

  @IsOptional()
  takesSupplements?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customMemories?: string[];

  @IsOptional()
  @IsString()
  macroPreset?: string;

  @IsOptional()
  @IsNumber()
  customCalories?: number;

  @IsOptional()
  @IsNumber()
  customProtein?: number;

  @IsOptional()
  @IsNumber()
  customCarbs?: number;

  @IsOptional()
  @IsNumber()
  customFats?: number;
  // Paso 1: Biometría
  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @IsNumber()
  @Min(10)
  age: number;

  @IsNumber()
  @Min(50)
  height: number; // en cm

  @IsNumber()
  @Min(20)
  weight: number; // valor introducido

  @IsIn(['kg', 'lbs'])
  weightUnit: 'kg' | 'lbs';

  @IsIn(['stable', 'fluctuating', 'increasing', 'decreasing'])
  weightBehavior: 'stable' | 'fluctuating' | 'increasing' | 'decreasing';

  // Paso 2: Objetivo
  @IsIn(['fat_loss', 'muscle_gain', 'recomposition', 'health_performance'])
  dietaryGoal:
    | 'fat_loss'
    | 'muscle_gain'
    | 'recomposition'
    | 'health_performance';

  // Paso 3: Biomecánica y Salud
  @IsIn(['beginner', 'intermediate', 'advanced'])
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';

  @IsIn(['commercial_gym', 'building_gym', 'home'])
  equipmentAccess: 'commercial_gym' | 'building_gym' | 'home';

  @IsArray()
  @IsString({ each: true })
  jointDiscomfort: string[]; // ['shoulders', 'lumbar', 'knees', 'cervical', 'wrists', 'none']

  // Paso 4: Estilo de vida y Estrés
  @IsIn(['sedentary', 'standing', 'heavy_labor'])
  neatLevel: 'sedentary' | 'standing' | 'heavy_labor';

  @IsIn(['under_6h', '6_to_7h', '7_to_9h_deep'])
  sleepQuality: 'under_6h' | '6_to_7h' | '7_to_9h_deep';

  @IsIn(['low', 'moderate', 'high'])
  stressLevel: 'low' | 'moderate' | 'high';

  // Paso 5: Psicología alimentaria y Digestión
  @IsIn(['afternoon', 'night', 'weekends', 'none'])
  anxietyTrigger: 'afternoon' | 'night' | 'weekends' | 'none';

  @IsIn(['good', 'bloated', 'lactose_intolerant', 'gluten_sensitive'])
  digestiveHealth:
    | 'good'
    | 'bloated'
    | 'lactose_intolerant'
    | 'gluten_sensitive';

  @IsIn(['2_to_3', '4_to_5'])
  mealFrequency: '2_to_3' | '4_to_5';
}
