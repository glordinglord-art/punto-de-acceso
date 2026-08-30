import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';

@Controller('gyms')
export class GymsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllGyms() {
    const gyms = await this.prisma.gym.findMany({
      where: { isActive: true },
      include: {
        branches: {
          where: { isActive: true },
          include: {
            _count: {
              select: { users: true },
            },
          },
        },
        _count: {
          select: { users: true, branches: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: gyms };
  }

  @Get(':id')
  async getGymById(@Param('id') id: string) {
    const gym = await this.prisma.gym.findUnique({
      where: { id },
      include: {
        branches: {
          where: { isActive: true },
          include: {
            _count: {
              select: { users: true },
            },
          },
        },
      },
    });
    if (!gym) throw new NotFoundException('Gimnasio no encontrado');
    return { success: true, data: gym };
  }

  @Post()
  async createGym(
    @Body()
    body: {
      name: string;
      slug?: string;
      description?: string;
      logoUrl?: string;
    },
  ) {
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const gym = await this.prisma.gym.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        logoUrl: body.logoUrl,
      },
    });
    return { success: true, data: gym };
  }

  @Put(':id')
  async updateGym(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      logoUrl?: string;
      isActive?: boolean;
    },
  ) {
    const gym = await this.prisma.gym.update({
      where: { id },
      data: body,
    });
    return { success: true, data: gym };
  }

  // ─── Branches (Sedes) ───

  @Get(':gymId/branches')
  async getBranches(@Param('gymId') gymId: string) {
    const branches = await this.prisma.branch.findMany({
      where: { gymId, isActive: true },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: branches };
  }

  @Post(':gymId/branches')
  async createBranch(
    @Param('gymId') gymId: string,
    @Body()
    body: {
      name: string;
      slug?: string;
      address?: string;
      city?: string;
      phone?: string;
    },
  ) {
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const branch = await this.prisma.branch.create({
      data: {
        gymId,
        name: body.name,
        slug,
        address: body.address,
        city: body.city || 'Medellín',
        phone: body.phone,
      },
    });
    return { success: true, data: branch };
  }

  @Put(':gymId/branches/:branchId')
  async updateBranch(
    @Param('branchId') branchId: string,
    @Body()
    body: {
      name?: string;
      address?: string;
      city?: string;
      phone?: string;
      isActive?: boolean;
    },
  ) {
    const branch = await this.prisma.branch.update({
      where: { id: branchId },
      data: body,
    });
    return { success: true, data: branch };
  }

  @Delete(':gymId/branches/:branchId')
  async deleteBranch(
    @Param('gymId') gymId: string,
    @Param('branchId') branchId: string,
  ) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch || branch.gymId !== gymId) {
      throw new NotFoundException('Sede no encontrada');
    }

    await this.prisma.$transaction([
      this.prisma.user.updateMany({
        where: { branchId },
        data: { branchId: null },
      }),
      this.prisma.invitationCode.deleteMany({
        where: { branchId },
      }),
      this.prisma.branch.delete({
        where: { id: branchId },
      }),
    ]);
    return { success: true };
  }
}
