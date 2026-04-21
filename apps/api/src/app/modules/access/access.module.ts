import { Global, Module } from '@nestjs/common';
import { AppAbilityFactory } from './app-ability.factory';
import { PoliciesGuard } from './policies.guard';

@Global()
@Module({
  providers: [AppAbilityFactory, PoliciesGuard],
  exports: [AppAbilityFactory, PoliciesGuard],
})
export class AccessModule {}
