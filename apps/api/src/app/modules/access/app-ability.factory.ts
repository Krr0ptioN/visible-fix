import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import type { RequestUser } from '../../common/auth/request-user.interface';
import { Action, type AppAbility } from './access.types';

@Injectable()
export class AppAbilityFactory {
  createForUser(user: RequestUser): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    can(Action.Read, 'Issue');
    can(Action.Create, 'Issue');

    if (user.role === 'admin') {
      can(Action.Manage, 'all');
    } else if (user.role === 'municipal_staff' && user.municipalityId) {
      can(Action.Read, 'AdminDashboard');
      can(Action.Update, 'Issue');
    }

    return build();
  }

  getIssueScope(user: RequestUser, ability: AppAbility, action: Action.Read | Action.Update) {
    if (ability.can(Action.Manage, 'all')) {
      return {};
    }

    if (ability.can(action, 'Issue') && user.municipalityId) {
      return { municipalityId: user.municipalityId };
    }

    return { municipalityId: -1 };
  }
}
