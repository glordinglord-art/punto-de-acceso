import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RegisterWithCodeUseCase } from '../../../application/use-cases/register-with-code.use-case';
import { GenerateInvitationCodeUseCase } from '../../../application/use-cases/generate-invitation-code.use-case';
import { ForgotPasswordUseCase } from '../../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../application/use-cases/reset-password.use-case';
import { LoginDto } from '../../../application/dtos/login.dto';
import { RegisterDto } from '../../../application/dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerWithCodeUseCase: RegisterWithCodeUseCase,
    private readonly generateInvitationCodeUseCase: GenerateInvitationCodeUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto.email, dto.password);
    return { success: true, data: result };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    await this.registerWithCodeUseCase.execute(dto);
    // Auto-login after register
    const result = await this.loginUseCase.execute(dto.email, dto.password);
    return { success: true, data: result };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    await this.forgotPasswordUseCase.execute(body.email);
    return {
      success: true,
      message: 'Se ha enviado un enlace de recuperación a tu correo',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    await this.resetPasswordUseCase.execute(body.token, body.newPassword);
    return {
      success: true,
      message: 'Tu contraseña ha sido restablecida con éxito',
    };
  }

  @Post('invitation-codes/:trainerId')
  @HttpCode(HttpStatus.CREATED)
  async generateCode(@Param('trainerId') trainerId: string) {
    const code = await this.generateInvitationCodeUseCase.execute(trainerId);
    return {
      success: true,
      data: { code: code.code, expiresAt: code.expiresAt },
    };
  }

  @Get('invitation-codes/:trainerId')
  async getCodesByTrainer(@Param('trainerId') trainerId: string) {
    const codes =
      await this.generateInvitationCodeUseCase.getByTrainer(trainerId);
    return {
      success: true,
      data: codes.map((c) => ({
        id: c.id,
        code: c.code,
        isUsed: c.isUsed,
        expiresAt: c.expiresAt,
        createdAt: c.createdAt,
      })),
    };
  }
}
