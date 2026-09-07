import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../../../application/use-cases/get-user.use-case';
import { GetUsersByTrainerUseCase } from '../../../application/use-cases/get-users-by-trainer.use-case';
import { UpdateProfileUseCase } from '../../../application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../../../application/use-cases/change-password.use-case';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../../../application/dtos/user.dto';
import { ChangePasswordDto } from '../../../application/use-cases/change-password.use-case';
import { UserResponseDto } from '../../../application/dtos/user-response.dto';
import {
  CompleteOnboardingUseCase,
  CompleteOnboardingDto,
} from '../../../application/use-cases/complete-onboarding.use-case';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../domain/ports/user.repository.port';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersByTrainerUseCase: GetUsersByTrainerUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.getUserUseCase.execute(id);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Get('trainer/:trainerId')
  async getUsersByTrainer(@Param('trainerId') trainerId: string) {
    const users = await this.getUsersByTrainerUseCase.execute(trainerId);
    return {
      success: true,
      data: users.map((u) => UserResponseDto.fromEntity(u)),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(dto);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Put(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.updateProfileUseCase.execute(id, dto);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Put(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const user = await this.changePasswordUseCase.execute(id, dto);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Put(':id/onboarding')
  async completeOnboarding(
    @Param('id') id: string,
    @Body() dto: CompleteOnboardingDto,
  ) {
    const user = await this.completeOnboardingUseCase.execute(id, dto);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Patch('trainer/:trainerId/link-client')
  async linkClient(
    @Param('trainerId') trainerId: string,
    @Body() body: { email: string },
  ) {
    const user = await this.userRepository.linkToTrainer(body.email, trainerId);
    if (!user)
      throw new NotFoundException(
        'No se encontró ningún usuario con ese email',
      );
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Put(':id/biological-phase')
  async updateBiologicalPhase(
    @Param('id') id: string,
    @Body() dto: { phase: string },
  ) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const weight = user.weight && user.weight > 30 ? user.weight : 75;
    const height = user.height && user.height > 100 ? user.height : 175;
    const bmr = 10 * weight + 6.25 * height - 5 * 26 + 5;
    const tdee = Math.round(bmr * 1.55);

    const phase = dto.phase.toLowerCase();
    let targetCalories = tdee;
    if (
      phase.includes('deficit') ||
      phase.includes('perder') ||
      phase.includes('defin')
    ) {
      targetCalories = Math.round(tdee * 0.8);
    } else if (
      phase.includes('volum') ||
      phase.includes('muscul') ||
      phase.includes('gain') ||
      phase.includes('aumento')
    ) {
      targetCalories = Math.round(tdee * 1.15);
    } else {
      targetCalories = tdee;
    }

    user.updateProfile({
      dietaryGoal: dto.phase,
      targetCalories,
    });

    const updated = await this.userRepository.update(user);
    return {
      success: true,
      message: `Fase biológica actualizada a "${dto.phase}". Requerimientos metabólicos recalculados: ${targetCalories} kcal.`,
      data: UserResponseDto.fromEntity(updated),
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.userRepository.delete(id);
    return { success: true };
  }
}
