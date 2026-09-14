import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { OnboardingSubmissionDto } from '../dtos/onboarding-submission.dto';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserResponseDto } from '../dtos/user-response.dto';

export interface OnboardingProcessResult {
  user: UserResponseDto;
  clinicalSummary: {
    justification: string;
    biomechanicAdvice?: string;
    adjustmentPercentage: number;
    recommendedWaterGlasses: number;
  };
  metrics: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
    weightKg: number;
  };
}

@Injectable()
export class ProcessOnboardingUseCase {
  private readonly logger = new Logger(ProcessOnboardingUseCase.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn(
        '⚠️ GEMINI_API_KEY no encontrada en ProcessOnboardingUseCase',
      );
    }
  }

  async execute(
    userId: string,
    dto: OnboardingSubmissionDto,
  ): Promise<OnboardingProcessResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 1. Normalización canónica de peso
    const weightKg =
      dto.weightUnit === 'lbs'
        ? Number((dto.weight / 2.20462).toFixed(1))
        : Number(dto.weight.toFixed(1));

    // 2. Cálculo BMR (Mifflin-St Jeor)
    const bmr = Math.round(
      dto.gender === 'male'
        ? 10 * weightKg + 6.25 * dto.height - 5 * dto.age + 5
        : 10 * weightKg + 6.25 * dto.height - 5 * dto.age - 161,
    );

    // 3. Multiplicador de Actividad (TDEE Base)
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      standing: 1.4,
      heavy_labor: 1.65,
    };
    const multiplier = activityMultipliers[dto.neatLevel] || 1.35;
    const tdee = Math.round(bmr * multiplier);

    // 4. Modulación Clínica Híbrida (Gemini AI + Fallback Determinista)
    const clinicalPlan = await this.modulateWithAiOrFallback(
      dto,
      weightKg,
      bmr,
      tdee,
    );

    // Recomendación de hidratación (35ml por kg)
    const recommendedWaterGlasses = Math.max(
      8,
      Math.round((weightKg * 35) / 250),
    );

    // Respetar ajuste manual si fue personalizado por el atleta/entrenador
    const finalCalories = dto.customCalories || clinicalPlan.targetCalories;
    const finalProtein = dto.customProtein || clinicalPlan.targetProtein;
    const finalCarbs = dto.customCarbs || clinicalPlan.targetCarbs;
    const finalFats = dto.customFats || clinicalPlan.targetFats;

    // Normalización de molestias articulares y condiciones médicas
    const filteredJoints = (dto.jointDiscomfort || []).filter(
      (j) => j !== 'none',
    );
    const conditionsParts: string[] = [];
    if (dto.medicalConditionsList && dto.medicalConditionsList.length > 0) {
      conditionsParts.push(...dto.medicalConditionsList);
    }
    if (filteredJoints.length > 0) {
      conditionsParts.push(`Molestias en: ${filteredJoints.join(', ')}`);
    }
    const medicalConditions =
      conditionsParts.length > 0
        ? conditionsParts.join(' | ')
        : 'Sin condiciones médicas ni molestias reportadas';

    const digestiveMap: Record<string, string> = {
      good: 'Digestión ligera y regular',
      bloated: 'Tendencia a inflamación/gases',
      lactose_intolerant: 'Intolerancia a la lactosa',
      gluten_sensitive: 'Sensibilidad al gluten',
    };
    const dietaryPreferences =
      digestiveMap[dto.digestiveHealth] || dto.digestiveHealth;

    // 5. Persistencia Transaccional
    user.completeOnboarding({
      weight: weightKg,
      height: dto.height,
      dietaryGoal: dto.dietaryGoal,
      targetCalories: finalCalories,
      targetProtein: finalProtein,
      targetCarbs: finalCarbs,
      targetFats: finalFats,
      weightUnitPreference: dto.weightUnit,
      gender: dto.gender,
      age: dto.age,
      anamnesisData: dto,
      experienceLevel: dto.experienceLevel,
      equipmentAccess: dto.equipmentAccess,
      medicalConditions,
      dietaryPreferences,
    });

    const updatedUser = await this.userRepository.update(user);

    // Crear/actualizar registro inicial en DailyStressLog
    try {
      const today = new Date().toISOString().split('T')[0];
      const stressScore =
        dto.stressLevel === 'high' ? 8 : dto.stressLevel === 'moderate' ? 5 : 2;
      const energyScore =
        dto.sleepQuality === 'under_6h'
          ? 4
          : dto.sleepQuality === '6_to_7h'
            ? 7
            : 9;
      const moodMap: Record<string, string> = {
        high: 'anxious',
        moderate: 'focused',
        low: 'calm',
      };

      await this.prisma.dailyStressLog.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        create: {
          userId,
          date: today,
          stressLevel: stressScore,
          energyLevel: energyScore,
          mood: moodMap[dto.stressLevel] || 'focused',
          notes: 'Evaluación inicial Anamnesis VitalFit',
        },
        update: {
          stressLevel: stressScore,
          energyLevel: energyScore,
          mood: moodMap[dto.stressLevel] || 'focused',
        },
      });
    } catch (stressErr) {
      this.logger.warn(
        `No se pudo registrar DailyStressLog inicial: ${stressErr instanceof Error ? stressErr.message : String(stressErr)}`,
      );
    }

    return {
      user: UserResponseDto.fromEntity(updatedUser),
      clinicalSummary: {
        justification: clinicalPlan.justification,
        biomechanicAdvice: clinicalPlan.biomechanicAdvice,
        adjustmentPercentage: clinicalPlan.adjustmentPercentage,
        recommendedWaterGlasses,
      },
      metrics: {
        bmr,
        tdee,
        targetCalories: finalCalories,
        targetProtein: finalProtein,
        targetCarbs: finalCarbs,
        targetFats: finalFats,
        weightKg,
      },
    };
  }

  private async modulateWithAiOrFallback(
    dto: OnboardingSubmissionDto,
    weightKg: number,
    bmr: number,
    tdee: number,
  ): Promise<{
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
    adjustmentPercentage: number;
    justification: string;
    biomechanicAdvice?: string;
  }> {
    // Intentar modulación con Gemini 2.5 Flash
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
        });

        const prompt = `
Eres el Director Clínico y de Alto Rendimiento de Vital Fit. Tu misión es diseñar la partición calórica y de macronutrientes exacta para un nuevo atleta con base en su anamnesis.

DATOS FISIOLÓGICOS Y METABÓLICOS:
- Sexo: ${dto.gender}
- Edad: ${dto.age} años
- Estatura: ${dto.height} cm
- Peso canónico: ${weightKg} kg (indicado originalmente como ${dto.weight} ${dto.weightUnit})
- Comportamiento de peso reciente: ${dto.weightBehavior}
- Tasa Metabólica Basal (BMR Mifflin-St Jeor): ${bmr} kcal
- Nivel NEAT: ${dto.neatLevel}
- Gasto Energético Total (TDEE Base): ${tdee} kcal
- Objetivo principal: ${dto.dietaryGoal} (fat_loss: quema de grasa | muscle_gain: hipertrofia | recomposition: recomposición | health_performance: salud y rendimiento)

PERFIL BIO-NEUROLÓGICO Y ESTILO DE VIDA:
- Calidad de sueño: ${dto.sleepQuality}
- Nivel de estrés: ${dto.stressLevel}
- Gatillo de apetito / ansiedad: ${dto.anxietyTrigger}
- Salud digestiva: ${dto.digestiveHealth}
- Frecuencia de comidas: ${dto.mealFrequency}
- Molestias articulares reportadas: ${dto.jointDiscomfort.join(', ') || 'Ninguna'}
- Nivel de experiencia en fuerza: ${dto.experienceLevel}
- Acceso a equipo: ${dto.equipmentAccess}

CRITERIOS CLÍNICOS VITAL FIT:
1. Si el estrés es ALTO o el sueño es deficiente (<6h), modera el déficit calórico (no más del 12-15%) para evitar sobrecargar el eje HPA y elevar el cortisol.
2. Mantén la proteína entre 1.8 y 2.4 g/kg según el objetivo y el déficit.
3. Grasas saludables entre 0.8 y 1.0 g/kg para salud hormonal.
4. Carbohidratos completan el restante calórico: (Calorías - (Proteína*4 + Grasas*9)) / 4.
5. Si reporta molestias articulares, incluye una breve directriz biomecánica para el entrenamiento.

Responde ÚNICAMENTE un JSON válido (sin formato markdown ni texto adicional) con esta estructura exacta:
{
  "targetCalories": 2100,
  "targetProtein": 165,
  "targetCarbs": 215,
  "targetFats": 65,
  "adjustmentPercentage": -15,
  "justification": "Explicación clínica empática y precisa en español (máx 3 oraciones) de por qué se asignó esta configuración calórica considerando su nivel de estrés y objetivo.",
  "biomechanicAdvice": "Consejo biomecánico para proteger articulaciones si las hay (máx 2 oraciones)."
}
`;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const cleaned = text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const parsed = JSON.parse(cleaned);

        if (
          parsed.targetCalories &&
          parsed.targetProtein &&
          parsed.targetCarbs &&
          parsed.targetFats
        ) {
          return {
            targetCalories: Math.round(parsed.targetCalories),
            targetProtein: Math.round(parsed.targetProtein),
            targetCarbs: Math.round(parsed.targetCarbs),
            targetFats: Math.round(parsed.targetFats),
            adjustmentPercentage: Number(parsed.adjustmentPercentage || 0),
            justification:
              parsed.justification ||
              'Plan nutricional individualizado según tu gasto metabólico y estilo de vida.',
            biomechanicAdvice: parsed.biomechanicAdvice,
          };
        }
      } catch (aiError) {
        this.logger.warn(
          `Fallo o demora en Gemini al modular anamnesis, activando motor determinista: ${aiError instanceof Error ? aiError.message : String(aiError)}`,
        );
      }
    }

    // ─── FALLBACK DETERMINISTA CIENTÍFICO ───
    return this.calculateDeterministicPlan(dto, weightKg, tdee);
  }

  private calculateDeterministicPlan(
    dto: OnboardingSubmissionDto,
    weightKg: number,
    tdee: number,
  ) {
    let adjustmentPercentage = 0;
    let proteinGPerKg = 2.0;
    let fatGPerKg = 0.9;
    let justification = '';

    const isHighStress =
      dto.stressLevel === 'high' || dto.sleepQuality === 'under_6h';

    switch (dto.dietaryGoal) {
      case 'fat_loss':
        adjustmentPercentage = isHighStress ? -12 : -20;
        proteinGPerKg = 2.2;
        fatGPerKg = 0.8;
        justification = isHighStress
          ? 'Aplicamos un déficit calórico moderado (-12%) para proteger tu masa muscular y evitar elevar tus niveles de cortisol y fatiga.'
          : 'Establecemos un déficit calórico controlado (-20%) con alta densidad de proteína para optimizar la pérdida de grasa corporal.';
        break;

      case 'muscle_gain':
        adjustmentPercentage = 12;
        proteinGPerKg = 2.0;
        fatGPerKg = 0.9;
        justification =
          'Configuramos un superávit calórico óptimo (+12%) para promover la hipertrofia muscular minimizando la ganancia de tejido graso.';
        break;

      case 'recomposition':
        adjustmentPercentage = -5;
        proteinGPerKg = 2.3;
        fatGPerKg = 0.85;
        justification =
          'Estrategia normocalórica con ligero ajuste (-5%) y proteína elevada (2.3g/kg) para promover recomposición corporal simultánea.';
        break;

      case 'health_performance':
      default:
        adjustmentPercentage = 0;
        proteinGPerKg = 1.8;
        fatGPerKg = 1.0;
        justification =
          'Equilibrio energético pleno al 100% de tu TDEE para maximizar tu vitalidad, enfoque diario y rendimiento general.';
        break;
    }

    const targetCalories = Math.round(tdee * (1 + adjustmentPercentage / 100));
    const targetProtein = Math.round(weightKg * proteinGPerKg);
    const targetFats = Math.round(weightKg * fatGPerKg);
    const carbsCalories = Math.max(
      0,
      targetCalories - (targetProtein * 4 + targetFats * 9),
    );
    const targetCarbs = Math.round(carbsCalories / 4);

    const hasJoints =
      (dto.jointDiscomfort || []).filter((j) => j !== 'none').length > 0;
    const biomechanicAdvice = hasJoints
      ? 'Ajustaremos la selección de ejercicios y rangos de movimiento para proteger las articulaciones sensibles reportadas.'
      : undefined;

    return {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      adjustmentPercentage,
      justification,
      biomechanicAdvice,
    };
  }
}
