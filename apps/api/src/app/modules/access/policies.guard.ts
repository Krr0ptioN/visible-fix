import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { RequestUser } from '../../common/auth/request-user.interface';
import { AppAbilityFactory } from './app-ability.factory';
import { CHECK_POLICIES_KEY, type PolicyHandler } from './policies.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: AppAbilityFactory
  ) {}

  canActivate(context: ExecutionContext) {
    const handlers = this.reflector.getAllAndOverride<PolicyHandler[]>(CHECK_POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!handlers?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const ability = this.abilityFactory.createForUser(request.user);
    const isAllowed = handlers.every((handler) => handler(ability));

    if (!isAllowed) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }
}
