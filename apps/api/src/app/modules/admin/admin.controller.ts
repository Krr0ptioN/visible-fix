import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/request-user.interface';
import { Action } from '../access/access.types';
import { CheckPolicies } from '../access/policies.decorator';
import { PoliciesGuard } from '../access/policies.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@CheckPolicies((ability) => ability.can(Action.Read, 'AdminDashboard') || ability.can(Action.Manage, 'all'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview(@CurrentUser() user: RequestUser) {
    return this.adminService.getOverview(user);
  }

  @Get('issues')
  getIssues(@CurrentUser() user: RequestUser, @Query() query: unknown) {
    return this.adminService.getIssues(user, query);
  }

  @Patch('issues/:id/status')
  updateIssueStatus(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() body: unknown) {
    return this.adminService.updateIssueStatus(user, id, body);
  }
}
