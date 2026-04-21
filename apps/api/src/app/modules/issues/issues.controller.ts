import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/request-user.interface';
import { Action } from '../access/access.types';
import { CheckPolicies } from '../access/policies.decorator';
import { PoliciesGuard } from '../access/policies.guard';
import { AdminService } from '../admin/admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IssuesService } from './issues.service';

@Controller()
export class IssuesController {
  constructor(
    private readonly issuesService: IssuesService,
    private readonly adminService: AdminService
  ) {}

  @Get('issues')
  getIssues(@Query() query: unknown) {
    return this.issuesService.getIssues(query);
  }

  @Get('issues/search')
  searchIssues(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.issuesService.searchIssues(q, limit);
  }

  @Get('issues/:id')
  getIssueById(@Param('id') id: string) {
    return this.issuesService.getIssueById(id);
  }

  @Post('issues')
  createIssue(@Body() body: unknown) {
    return this.issuesService.createIssue(body);
  }

  @Patch('issues/:id/status')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, 'AdminDashboard') || ability.can(Action.Manage, 'all'))
  updateIssueStatus(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: RequestUser) {
    return this.adminService.updateIssueStatus(user, id, body);
  }

  @Get('issues/:id/upvotes')
  getUpvotesByIssue(@Param('id') issueId: string) {
    return this.issuesService.getUpvotesByIssue(issueId);
  }

  @Post('upvotes')
  createUpvote(@Body() body: unknown) {
    return this.issuesService.createUpvote(body);
  }

  @Delete('upvotes/:id')
  removeUpvote(@Param('id') id: string) {
    return this.issuesService.removeUpvote(id);
  }
}
