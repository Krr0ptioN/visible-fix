import { DynamicModule, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_CONFIG, type ApplicationBootstrapOptions } from '../../app.config';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSessionRepository } from './auth-session.repository';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Global()
export class AuthModule {
  static register(config: ApplicationBootstrapOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [JwtModule.register({}), UsersModule],
      controllers: [AuthController],
      providers: [
        AuthService,
        AuthSessionRepository,
        PasswordService,
        TokenService,
        JwtAuthGuard,
        {
          provide: APP_CONFIG,
          useValue: config,
        },
      ],
      exports: [AuthService, AuthSessionRepository, TokenService, JwtAuthGuard],
    };
  }
}
