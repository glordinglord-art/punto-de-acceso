import { BaseEntity } from '../../../../shared/domain/base.entity';
import { UserRole } from '../enums/user-role.enum';

export interface CreateUserProps {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  trainerId?: string;
  avatarUrl?: string;
  phone?: string;
  dietaryGoal?: string;
  weight?: number;
  height?: number;
  targetCalories?: number;
  onboardingCompleted?: boolean;

  // Advanced Profile
  experienceLevel?: string;
  equipmentAccess?: string;
  medicalConditions?: string;
  dietaryPreferences?: string;
}

export class User extends BaseEntity {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  trainerId: string | null;
  avatarUrl: string | null;
  phone: string | null;
  dietaryGoal: string | null;
  weight: number | null;
  height: number | null;
  targetCalories: number | null;
  onboardingCompleted: boolean;

  // Advanced Profile
  experienceLevel: string | null;
  equipmentAccess: string | null;
  medicalConditions: string | null;
  dietaryPreferences: string | null;

  isActive: boolean;

  constructor(props: CreateUserProps, id?: string) {
    super(id);
    this.email = props.email;
    this.name = props.name;
    this.password = props.password;
    this.role = props.role;
    this.trainerId = props.trainerId ?? null;
    this.avatarUrl = props.avatarUrl ?? null;
    this.phone = props.phone ?? null;
    this.dietaryGoal = props.dietaryGoal ?? null;
    this.weight = props.weight ?? null;
    this.height = props.height ?? null;
    this.targetCalories = props.targetCalories ?? null;
    this.onboardingCompleted = props.onboardingCompleted ?? false;

    this.experienceLevel = props.experienceLevel ?? null;
    this.equipmentAccess = props.equipmentAccess ?? null;
    this.medicalConditions = props.medicalConditions ?? null;
    this.dietaryPreferences = props.dietaryPreferences ?? null;

    this.isActive = true;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isTrainer(): boolean {
    return this.role === UserRole.TRAINER;
  }

  isClient(): boolean {
    return this.role === UserRole.CLIENT;
  }

  deactivate(): void {
    this.isActive = false;
    this.markUpdated();
  }

  updateProfile(
    data: Partial<{
      name: string;
      avatarUrl: string | null;
      phone: string | null;
      dietaryGoal: string | null;
      weight: number | null;
      height: number | null;
      targetCalories: number | null;
      experienceLevel: string | null;
      equipmentAccess: string | null;
      medicalConditions: string | null;
      dietaryPreferences: string | null;
    }>,
  ): void {
    if (data.name) this.name = data.name;
    if (data.avatarUrl !== undefined) this.avatarUrl = data.avatarUrl;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.dietaryGoal !== undefined) this.dietaryGoal = data.dietaryGoal;
    if (data.weight !== undefined) this.weight = data.weight;
    if (data.height !== undefined) this.height = data.height;
    if (data.targetCalories !== undefined)
      this.targetCalories = data.targetCalories;
    if (data.experienceLevel !== undefined)
      this.experienceLevel = data.experienceLevel;
    if (data.equipmentAccess !== undefined)
      this.equipmentAccess = data.equipmentAccess;
    if (data.medicalConditions !== undefined)
      this.medicalConditions = data.medicalConditions;
    if (data.dietaryPreferences !== undefined)
      this.dietaryPreferences = data.dietaryPreferences;
    this.markUpdated();
  }

  completeOnboarding(data: {
    weight: number;
    height: number;
    dietaryGoal: string;
    experienceLevel?: string;
    equipmentAccess?: string;
    medicalConditions?: string;
    dietaryPreferences?: string;
  }): void {
    this.weight = data.weight;
    this.height = data.height;
    this.dietaryGoal = data.dietaryGoal;

    if (data.experienceLevel !== undefined)
      this.experienceLevel = data.experienceLevel;
    if (data.equipmentAccess !== undefined)
      this.equipmentAccess = data.equipmentAccess;
    if (data.medicalConditions !== undefined)
      this.medicalConditions = data.medicalConditions;
    if (data.dietaryPreferences !== undefined)
      this.dietaryPreferences = data.dietaryPreferences;

    this.onboardingCompleted = true;
    this.markUpdated();
  }

  changePassword(hashedPassword: string): void {
    this.password = hashedPassword;
    this.markUpdated();
  }
}
