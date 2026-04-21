import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@visiblefix/shared/types';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(id: number) {
    return this.usersRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  create(input: {
    email: string;
    name?: string | null;
    role: AuthUser['role'];
    passwordHash?: string | null;
    municipalityId?: number | null;
  }) {
    return this.usersRepository.create(input);
  }

  toAuthUser(user: {
    id: number;
    email: string;
    name: string | null;
    role: AuthUser['role'];
    municipalityId: number | null;
  }): AuthUser {
    return {
      id: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      municipalityId: user.municipalityId ? String(user.municipalityId) : null,
    };
  }
}
