import { Request } from 'express';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {

  constructor(
      readonly configService: ConfigService,
      private readonly userService: UserService) {
    super({
      secretOrKey: configService.get<string>('jwt.secret'),
      jwtFromRequest: (request: Request) => {
        return ExtractJwt.fromAuthHeaderAsBearerToken()(request) || request.cookies.token;
      },
      ignoreExpiration: false,
    });
  }

  public async validate(payload: Pick<UserEntity, 'id'|'username'>) {
    // TODO: 使用校验码校验token有效性
    const user = await this.userService.getUserByUsername(payload.username);
    if(!user) {
      throw new UnauthorizedException();
    } else {
      return user;
    }
  }
}
