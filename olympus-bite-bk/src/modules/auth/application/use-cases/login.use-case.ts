import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user.repository.port';
import * as crypto from 'crypto';

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    dietaryGoal?: string | null;
    weight?: number | null;
    height?: number | null;
    onboardingCompleted: boolean;
    experienceLevel?: string | null;
    equipmentAccess?: string | null;
    medicalConditions?: string | null;
    dietaryPreferences?: string | null;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    if (user.password !== hashedPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    // Token simple para MVP - en producción usar JWT real
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = Buffer.from(JSON.stringify(tokenPayload)).toString(
      'base64',
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        dietaryGoal: user.dietaryGoal,
        weight: user.weight,
        height: user.height,
        onboardingCompleted: user.onboardingCompleted,
        experienceLevel: user.experienceLevel,
        equipmentAccess: user.equipmentAccess,
        medicalConditions: user.medicalConditions,
        dietaryPreferences: user.dietaryPreferences,
      },
    };
  }
}
