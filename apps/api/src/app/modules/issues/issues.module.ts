import { Module, forwardRef } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { IssuesController } from './issues.controller';
import { IssuesRepository } from './issues.repository';
import { IssuesService } from './issues.service';
import { UpvotesRepository } from './upvotes.repository';

@Module({
  imports: [AccessModule, AuthModule, forwardRef(() => AdminModule)],
  controllers: [IssuesController],
  providers: [IssuesRepository, UpvotesRepository, IssuesService],
  exports: [IssuesRepository, UpvotesRepository, IssuesService],
})
export class IssuesModule {}
