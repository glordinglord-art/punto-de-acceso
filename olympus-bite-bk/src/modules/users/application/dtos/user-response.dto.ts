import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  phone: string | null;
  dietaryGoal: string | null;
  weight: number | null;
  height: number | null;
  onboardingCompleted: boolean;

  // Advanced Profile
  experienceLevel: string | null;
  equipmentAccess: string | null;
  medicalConditions: string | null;
  dietaryPreferences: string | null;

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
    dto.dietaryGoal = user.dietaryGoal;
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
