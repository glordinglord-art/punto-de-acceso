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
import { randomUUID } from 'crypto';

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

interface RawDbRow {
  id: string;
  client_id: string;
  trainer_id: string;
  date: Date;
  neck: number | null;
  back: number | null;
  right_arm: number | null;
  left_arm: number | null;
  waist: number | null;
  hip: number | null;
  right_thigh: number | null;
  left_thigh: number | null;
  right_knee: number | null;
  left_knee: number | null;
  right_calf: number | null;
  left_calf: number | null;
  weight: number | null;
  fat_percentage: number | null;
  muscle_percentage: number | null;
  water_percentage: number | null;
  bone_percentage: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  trainer_name?: string | null;
  trainer_email?: string | null;
}

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly prisma: PrismaService) {}

  private mapRow(row: RawDbRow): PhysicalAssessmentRecord {
    return {
      id: row.id,
      clientId: row.client_id,
      trainerId: row.trainer_id,
      date: row.date,
      neck: row.neck !== null ? Number(row.neck) : null,
      back: row.back !== null ? Number(row.back) : null,
      rightArm: row.right_arm !== null ? Number(row.right_arm) : null,
      leftArm: row.left_arm !== null ? Number(row.left_arm) : null,
      waist: row.waist !== null ? Number(row.waist) : null,
      hip: row.hip !== null ? Number(row.hip) : null,
      rightThigh: row.right_thigh !== null ? Number(row.right_thigh) : null,
      leftThigh: row.left_thigh !== null ? Number(row.left_thigh) : null,
      rightKnee: row.right_knee !== null ? Number(row.right_knee) : null,
      leftKnee: row.left_knee !== null ? Number(row.left_knee) : null,
      rightCalf: row.right_calf !== null ? Number(row.right_calf) : null,
      leftCalf: row.left_calf !== null ? Number(row.left_calf) : null,
      weight: row.weight !== null ? Number(row.weight) : null,
      fatPercentage:
        row.fat_percentage !== null ? Number(row.fat_percentage) : null,
      musclePercentage:
        row.muscle_percentage !== null ? Number(row.muscle_percentage) : null,
      waterPercentage:
        row.water_percentage !== null ? Number(row.water_percentage) : null,
      bonePercentage:
        row.bone_percentage !== null ? Number(row.bone_percentage) : null,
      notes: row.notes || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      trainer: row.trainer_name
        ? {
            id: row.trainer_id,
            name: row.trainer_name,
            email: row.trainer_email || '',
          }
        : undefined,
    };
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

    const rows = await this.prisma.$queryRawUnsafe<RawDbRow[]>(
      `SELECT a.*, u.name as trainer_name, u.email as trainer_email
       FROM physical_assessments a
       LEFT JOIN users u ON a.trainer_id = u.id
       WHERE a.client_id = $1
       ORDER BY a.date DESC`,
      clientId,
    );

    const assessments = rows.map((r) => this.mapRow(r));

    // Calculate smart evolution if at least 2 records exist
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
      trainerId?: string;
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
    if (!dto.clientId) {
      throw new BadRequestException('clientId es requerido');
    }

    let finalTrainerId = dto.trainerId;
    if (!finalTrainerId) {
      const clientUser = await this.prisma.user.findUnique({
        where: { id: dto.clientId },
        select: { trainerId: true },
      });
      finalTrainerId = clientUser?.trainerId || '';
    }

    if (!finalTrainerId) {
      const fallback = await this.prisma.user.findFirst({
        where: { role: { in: ['trainer', 'super_admin', 'admin'] } },
        select: { id: true },
      });
      finalTrainerId = fallback?.id || dto.clientId;
    }

    const id = randomUUID();
    const now = new Date();
    const assessmentDate = dto.date ? new Date(dto.date) : now;

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO physical_assessments (
        id, client_id, trainer_id, date,
        neck, back, right_arm, left_arm, waist, hip,
        right_thigh, left_thigh, right_knee, left_knee, right_calf, left_calf,
        weight, fat_percentage, muscle_percentage, water_percentage, bone_percentage,
        notes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24
      )`,
      id,
      dto.clientId,
      finalTrainerId,
      assessmentDate,
      dto.neck !== undefined ? dto.neck : null,
      dto.back !== undefined ? dto.back : null,
      dto.rightArm !== undefined ? dto.rightArm : null,
      dto.leftArm !== undefined ? dto.leftArm : null,
      dto.waist !== undefined ? dto.waist : null,
      dto.hip !== undefined ? dto.hip : null,
      dto.rightThigh !== undefined ? dto.rightThigh : null,
      dto.leftThigh !== undefined ? dto.leftThigh : null,
      dto.rightKnee !== undefined ? dto.rightKnee : null,
      dto.leftKnee !== undefined ? dto.leftKnee : null,
      dto.rightCalf !== undefined ? dto.rightCalf : null,
      dto.leftCalf !== undefined ? dto.leftCalf : null,
      dto.weight !== undefined ? dto.weight : null,
      dto.fatPercentage !== undefined ? dto.fatPercentage : null,
      dto.musclePercentage !== undefined ? dto.musclePercentage : null,
      dto.waterPercentage !== undefined ? dto.waterPercentage : null,
      dto.bonePercentage !== undefined ? dto.bonePercentage : null,
      dto.notes || null,
      now,
      now,
    );

    // If weight is provided, update client's current weight
    if (dto.weight) {
      await this.prisma.user.update({
        where: { id: dto.clientId },
        data: { weight: dto.weight },
      });
    }

    const insertedRows = await this.prisma.$queryRawUnsafe<RawDbRow[]>(
      `SELECT * FROM physical_assessments WHERE id = $1`,
      id,
    );

    return insertedRows[0] ? this.mapRow(insertedRows[0]) : { id };
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
    const existing = await this.prisma.$queryRawUnsafe<RawDbRow[]>(
      `SELECT * FROM physical_assessments WHERE id = $1`,
      id,
    );

    if (!existing || existing.length === 0) {
      throw new NotFoundException('Valoración no encontrada');
    }

    const assessmentDate = dto.date
      ? new Date(dto.date)
      : existing[0].date;

    await this.prisma.$executeRawUnsafe(
      `UPDATE physical_assessments SET
        date = $2,
        neck = $3,
        back = $4,
        right_arm = $5,
        left_arm = $6,
        waist = $7,
        hip = $8,
        right_thigh = $9,
        left_thigh = $10,
        right_knee = $11,
        left_knee = $12,
        right_calf = $13,
        left_calf = $14,
        weight = $15,
        fat_percentage = $16,
        muscle_percentage = $17,
        water_percentage = $18,
        bone_percentage = $19,
        notes = $20,
        updated_at = NOW()
      WHERE id = $1`,
      id,
      assessmentDate,
      dto.neck !== undefined ? dto.neck : existing[0].neck,
      dto.back !== undefined ? dto.back : existing[0].back,
      dto.rightArm !== undefined ? dto.rightArm : existing[0].right_arm,
      dto.leftArm !== undefined ? dto.leftArm : existing[0].left_arm,
      dto.waist !== undefined ? dto.waist : existing[0].waist,
      dto.hip !== undefined ? dto.hip : existing[0].hip,
      dto.rightThigh !== undefined ? dto.rightThigh : existing[0].right_thigh,
      dto.leftThigh !== undefined ? dto.leftThigh : existing[0].left_thigh,
      dto.rightKnee !== undefined ? dto.rightKnee : existing[0].right_knee,
      dto.leftKnee !== undefined ? dto.leftKnee : existing[0].left_knee,
      dto.rightCalf !== undefined ? dto.rightCalf : existing[0].right_calf,
      dto.leftCalf !== undefined ? dto.leftCalf : existing[0].left_calf,
      dto.weight !== undefined ? dto.weight : existing[0].weight,
      dto.fatPercentage !== undefined
        ? dto.fatPercentage
        : existing[0].fat_percentage,
      dto.musclePercentage !== undefined
        ? dto.musclePercentage
        : existing[0].muscle_percentage,
      dto.waterPercentage !== undefined
        ? dto.waterPercentage
        : existing[0].water_percentage,
      dto.bonePercentage !== undefined
        ? dto.bonePercentage
        : existing[0].bone_percentage,
      dto.notes !== undefined ? dto.notes : existing[0].notes,
    );

    const updatedRows = await this.prisma.$queryRawUnsafe<RawDbRow[]>(
      `SELECT * FROM physical_assessments WHERE id = $1`,
      id,
    );

    return updatedRows[0] ? this.mapRow(updatedRows[0]) : { id };
  }

  @Delete(':id')
  async deleteAssessment(@Param('id') id: string) {
    const existing = await this.prisma.$queryRawUnsafe<RawDbRow[]>(
      `SELECT id FROM physical_assessments WHERE id = $1`,
      id,
    );

    if (!existing || existing.length === 0) {
      throw new NotFoundException('Valoración no encontrada');
    }

    await this.prisma.$executeRawUnsafe(
      `DELETE FROM physical_assessments WHERE id = $1`,
      id,
    );

    return { success: true, message: 'Valoración eliminada correctamente' };
  }
}
