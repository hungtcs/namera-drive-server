import jwt from 'jsonwebtoken';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@user';
import { JWTStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('jwt.secret'),
          signOptions: configService.get<jwt.SignOptions>('jwt.signOptions'),
        };
      },
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  exports: [
    AuthService,
  ],
  providers: [
    AuthService,
    JWTStrategy,
    LocalStrategy,
  ],
  controllers: [
    AuthController,
  ],
})
export class AuthModule {

}
