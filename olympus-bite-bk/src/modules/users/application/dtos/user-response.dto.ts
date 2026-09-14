import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  phone: string | null;
  dietaryGoal: string | null;
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFats: number | null;
  weightUnitPreference: string;
  gender: string | null;
  age: number | null;
  anamnesisData: any;
  weight: number | null;
  height: number | null;
  onboardingCompleted: boolean;

  // Advanced Profile
  experienceLevel: string | null;
  equipmentAccess: string | null;
  medicalConditions: string | null;
  dietaryPreferences: string | null;

  trainerId: string | null;
  gymId: string | null;
  branchId: string | null;
  isActive: boolean;
  createdAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.role = user.role;
    dto.avatarUrl = user.avatarUrl;
    dto.phone = user.phone;
    dto.trainerId = user.trainerId;
    dto.gymId = user.gymId;
    dto.branchId = user.branchId;
    dto.dietaryGoal = user.dietaryGoal;
    dto.targetCalories = user.targetCalories;
    dto.targetProtein = user.targetProtein;
    dto.targetCarbs = user.targetCarbs;
    dto.targetFats = user.targetFats;
    dto.weightUnitPreference = user.weightUnitPreference;
    dto.gender = user.gender;
    dto.age = user.age;
    dto.anamnesisData = user.anamnesisData;
    dto.weight = user.weight;
    dto.height = user.height;
    dto.onboardingCompleted = user.onboardingCompleted;

    dto.experienceLevel = user.experienceLevel;
    dto.equipmentAccess = user.equipmentAccess;
    dto.medicalConditions = user.medicalConditions;
    dto.dietaryPreferences = user.dietaryPreferences;

    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
