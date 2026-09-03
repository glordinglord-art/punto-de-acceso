import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';

interface PhysicalAssessmentRecord {
  id: string;
  clientId: string;
  trainerId: string;
  date: Date;
  neck: number | null;
  back: number | null;
  rightArm: number | null;
  leftArm: number | null;
  waist: number | null;
  hip: number | null;
  rightThigh: number | null;
  leftThigh: number | null;
  rightKnee: number | null;
  leftKnee: number | null;
  rightCalf: number | null;
  leftCalf: number | null;
  weight: number | null;
  fatPercentage: number | null;
  musclePercentage: number | null;
  waterPercentage: number | null;
  bonePercentage: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  trainer?: {
    id: string;
    name: string;
    email: string;
  };
}

interface AssessmentDelegate {
  findMany(args?: Record<string, unknown>): Promise<PhysicalAssessmentRecord[]>;
  findUnique(
    args: Record<string, unknown>,
  ): Promise<PhysicalAssessmentRecord | null>;
  create(args: Record<string, unknown>): Promise<PhysicalAssessmentRecord>;
  update(args: Record<string, unknown>): Promise<PhysicalAssessmentRecord>;
  delete(args: Record<string, unknown>): Promise<PhysicalAssessmentRecord>;
}

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly prisma: PrismaService) {}

  private get assessmentModel(): AssessmentDelegate {
    return (
      this.prisma as unknown as { physicalAssessment: AssessmentDelegate }
    ).physicalAssessment;
  }

  @Get('client/:clientId')
  async getClientAssessments(@Param('clientId') clientId: string) {
    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const assessments = await this.assessmentModel.findMany({
      where: { clientId },
      orderBy: { date: 'desc' },
      include: {
        trainer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Compute progress comparison if at least 2 records exist
    let progressSummary: {
      hasComparison: boolean;
      deltaWeight: number | null;
      deltaFat: number | null;
      deltaMuscle: number | null;
      deltaWaist: number | null;
      deltaHip: number | null;
      deltaRightArm: number | null;
      deltaRightThigh: number | null;
      smartInsights: string[];
    } | null = null;

    if (assessments.length >= 2) {
      const latest = assessments[0];
      const earliest = assessments[assessments.length - 1];

      const diff = (
        curr: number | null,
        prev: number | null,
      ): number | null => {
        if (curr === null || prev === null) return null;
        return Number((curr - prev).toFixed(2));
      };

      const deltaWeight = diff(latest.weight, earliest.weight);
      const deltaFat = diff(latest.fatPercentage, earliest.fatPercentage);
      const deltaMuscle = diff(
        latest.musclePercentage,
        earliest.musclePercentage,
      );
      const deltaWaist = diff(latest.waist, earliest.waist);
      const deltaHip = diff(latest.hip, earliest.hip);
      const deltaRightArm = diff(latest.rightArm, earliest.rightArm);
      const deltaRightThigh = diff(latest.rightThigh, earliest.rightThigh);

      const insights: string[] = [];

      if (deltaMuscle !== null && deltaMuscle > 0) {
        insights.push(`Masa Muscular: Aumentó +${deltaMuscle}%`);
      } else if (deltaMuscle !== null && deltaMuscle < 0) {
        insights.push(`Masa Muscular: Disminuyó ${deltaMuscle}%`);
      }

      if (deltaFat !== null && deltaFat < 0) {
        insights.push(`Grasa Corporal: Reducción de ${Math.abs(deltaFat)}%`);
      } else if (deltaFat !== null && deltaFat > 0) {
        insights.push(`Grasa Corporal: Variación de +${deltaFat}%`);
      }

      if (deltaWaist !== null && deltaWaist < 0) {
        insights.push(`Cintura: Reducción de ${Math.abs(deltaWaist)} cm`);
      } else if (deltaWaist !== null && deltaWaist > 0) {
        insights.push(`Cintura: Variación de +${deltaWaist} cm`);
      }

      if (deltaRightArm !== null && deltaRightArm > 0) {
        insights.push(`Brazo Derecho: Creció +${deltaRightArm} cm`);
      }

      if (deltaRightThigh !== null && deltaRightThigh > 0) {
        insights.push(`Pierna Derecha: Creció +${deltaRightThigh} cm`);
      }

      progressSummary = {
        hasComparison: true,
        deltaWeight,
        deltaFat,
        deltaMuscle,
        deltaWaist,
        deltaHip,
        deltaRightArm,
        deltaRightThigh,
        smartInsights: insights,
      };
    }

    return {
      client,
      assessments,
      progressSummary,
    };
  }

  @Post()
  async createAssessment(
    @Body()
    dto: {
      clientId: string;
      trainerId: string;
      date?: string;
      neck?: number | null;
      back?: number | null;
      rightArm?: number | null;
      leftArm?: number | null;
      waist?: number | null;
      hip?: number | null;
      rightThigh?: number | null;
      leftThigh?: number | null;
      rightKnee?: number | null;
      leftKnee?: number | null;
      rightCalf?: number | null;
      leftCalf?: number | null;
      weight?: number | null;
      fatPercentage?: number | null;
      musclePercentage?: number | null;
      waterPercentage?: number | null;
      bonePercentage?: number | null;
      notes?: string | null;
    },
  ) {
    if (!dto.clientId || !dto.trainerId) {
      throw new BadRequestException('clientId y trainerId son requeridos');
    }

    const assessmentDate = dto.date ? new Date(dto.date) : new Date();

    const created = await this.assessmentModel.create({
      data: {
        clientId: dto.clientId,
        trainerId: dto.trainerId,
        date: assessmentDate,
        neck: dto.neck !== undefined ? dto.neck : null,
        back: dto.back !== undefined ? dto.back : null,
        rightArm: dto.rightArm !== undefined ? dto.rightArm : null,
        leftArm: dto.leftArm !== undefined ? dto.leftArm : null,
        waist: dto.waist !== undefined ? dto.waist : null,
        hip: dto.hip !== undefined ? dto.hip : null,
        rightThigh: dto.rightThigh !== undefined ? dto.rightThigh : null,
        leftThigh: dto.leftThigh !== undefined ? dto.leftThigh : null,
        rightKnee: dto.rightKnee !== undefined ? dto.rightKnee : null,
        leftKnee: dto.leftKnee !== undefined ? dto.leftKnee : null,
        rightCalf: dto.rightCalf !== undefined ? dto.rightCalf : null,
        leftCalf: dto.leftCalf !== undefined ? dto.leftCalf : null,
        weight: dto.weight !== undefined ? dto.weight : null,
        fatPercentage:
          dto.fatPercentage !== undefined ? dto.fatPercentage : null,
        musclePercentage:
          dto.musclePercentage !== undefined ? dto.musclePercentage : null,
        waterPercentage:
          dto.waterPercentage !== undefined ? dto.waterPercentage : null,
        bonePercentage:
          dto.bonePercentage !== undefined ? dto.bonePercentage : null,
        notes: dto.notes || null,
      },
    });

    // If weight is provided, update client's current weight
    if (dto.weight) {
      await this.prisma.user.update({
        where: { id: dto.clientId },
        data: { weight: dto.weight },
      });
    }

    return created;
  }

  @Put(':id')
  async updateAssessment(
    @Param('id') id: string,
    @Body()
    dto: {
      date?: string;
      neck?: number | null;
      back?: number | null;
      rightArm?: number | null;
      leftArm?: number | null;
      waist?: number | null;
      hip?: number | null;
      rightThigh?: number | null;
      leftThigh?: number | null;
      rightKnee?: number | null;
      leftKnee?: number | null;
      rightCalf?: number | null;
      leftCalf?: number | null;
      weight?: number | null;
      fatPercentage?: number | null;
      musclePercentage?: number | null;
      waterPercentage?: number | null;
      bonePercentage?: number | null;
      notes?: string | null;
    },
  ) {
    const existing = await this.assessmentModel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Valoración no encontrada');
    }

    const assessmentDate = dto.date ? new Date(dto.date) : existing.date;

    const updated = await this.assessmentModel.update({
      where: { id },
      data: {
        date: assessmentDate,
        neck: dto.neck !== undefined ? dto.neck : existing.neck,
        back: dto.back !== undefined ? dto.back : existing.back,
        rightArm: dto.rightArm !== undefined ? dto.rightArm : existing.rightArm,
        leftArm: dto.leftArm !== undefined ? dto.leftArm : existing.leftArm,
        waist: dto.waist !== undefined ? dto.waist : existing.waist,
        hip: dto.hip !== undefined ? dto.hip : existing.hip,
        rightThigh:
          dto.rightThigh !== undefined ? dto.rightThigh : existing.rightThigh,
        leftThigh:
          dto.leftThigh !== undefined ? dto.leftThigh : existing.leftThigh,
        rightKnee:
          dto.rightKnee !== undefined ? dto.rightKnee : existing.rightKnee,
        leftKnee: dto.leftKnee !== undefined ? dto.leftKnee : existing.leftKnee,
        rightCalf:
          dto.rightCalf !== undefined ? dto.rightCalf : existing.rightCalf,
        leftCalf: dto.leftCalf !== undefined ? dto.leftCalf : existing.leftCalf,
        weight: dto.weight !== undefined ? dto.weight : existing.weight,
        fatPercentage:
          dto.fatPercentage !== undefined
            ? dto.fatPercentage
            : existing.fatPercentage,
        musclePercentage:
          dto.musclePercentage !== undefined
            ? dto.musclePercentage
            : existing.musclePercentage,
        waterPercentage:
          dto.waterPercentage !== undefined
            ? dto.waterPercentage
            : existing.waterPercentage,
        bonePercentage:
          dto.bonePercentage !== undefined
            ? dto.bonePercentage
            : existing.bonePercentage,
        notes: dto.notes !== undefined ? dto.notes : existing.notes,
      },
    });

    return updated;
  }

  @Delete(':id')
  async deleteAssessment(@Param('id') id: string) {
    const existing = await this.assessmentModel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Valoración no encontrada');
    }

    await this.assessmentModel.delete({
      where: { id },
    });

    return { success: true, message: 'Valoración eliminada correctamente' };
  }
}
