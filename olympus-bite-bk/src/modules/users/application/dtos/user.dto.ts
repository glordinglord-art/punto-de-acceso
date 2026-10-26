import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
} from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';

import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gymId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  trainerId?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  phone?: string | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  gymId?: string | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  branchId?: string | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  trainerId?: string | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  avatarUrl?: string | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  dietaryGoal?: string | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  experienceLevel?: string | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : Number(value)))
  targetCalories?: number | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  equipmentAccess?: string | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  medicalConditions?: string | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  dietaryPreferences?: string | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : Number(value)))
  weight?: number | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? null : Number(value)))
  height?: number | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? null : Number(value)))
  targetProtein?: number | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? null : Number(value)))
  targetCarbs?: number | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? null : Number(value)))
  targetFats?: number | null;

  @IsString()
  @IsOptional()
  weightUnitPreference?: string;

  @IsString()
  @IsOptional()
  gender?: string | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? null : Number(value)))
  age?: number | null;

  @IsOptional()
  anamnesisData?: any;

  @IsOptional()
  onboardingCompleted?: boolean;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}
