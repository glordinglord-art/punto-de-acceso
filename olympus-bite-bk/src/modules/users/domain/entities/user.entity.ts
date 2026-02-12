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
}

export class User extends BaseEntity {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  trainerId: string | null;
  avatarUrl: string | null;
  phone: string | null;
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

  updateProfile(data: Partial<Pick<User, 'name' | 'avatarUrl' | 'phone'>>): void {
    if (data.name) this.name = data.name;
    if (data.avatarUrl !== undefined) this.avatarUrl = data.avatarUrl;
    if (data.phone !== undefined) this.phone = data.phone;
    this.markUpdated();
  }

  changePassword(hashedPassword: string): void {
    this.password = hashedPassword;
    this.markUpdated();
  }
}
