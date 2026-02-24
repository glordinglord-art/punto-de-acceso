import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersByTrainerUseCase: GetUsersByTrainerUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
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
      data: users.map(UserResponseDto.fromEntity),
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
}
