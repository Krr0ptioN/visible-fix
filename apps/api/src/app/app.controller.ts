import { Body, Controller, Delete, ForbiddenException, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('issues')
  getIssues(@Query() query: unknown) {
    return this.appService.getIssues(query);
  }

  @Get('issues/search')
  searchIssues(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.appService.searchIssues(q, limit);
  }

  @Get('issues/:id')
  getIssueById(@Param('id') id: string) {
    return this.appService.getIssueById(id);
  }

  @Post('issues')
  createIssue(@Body() body: unknown) {
    return this.appService.createIssue(body);
  }

  @Patch('issues/:id/status')
  updateIssueStatus(@Param('id') id: string, @Body() body: unknown, @Headers('x-admin-token') adminToken?: string) {
    const expectedToken = process.env.ADMIN_TOKEN;
    if (!expectedToken || adminToken !== expectedToken) {
      throw new ForbiddenException('Admin token required');
    }

    return this.appService.updateIssueStatus(id, body);
  }

  @Get('issues/:id/upvotes')
  getUpvotesByIssue(@Param('id') issueId: string) {
    return this.appService.getUpvotesByIssue(issueId);
  }

  @Post('upvotes')
  createUpvote(@Body() body: unknown) {
    return this.appService.createUpvote(body);
  }

  @Delete('upvotes/:id')
  removeUpvote(@Param('id') id: string) {
    return this.appService.removeUpvote(id);
  }
}
