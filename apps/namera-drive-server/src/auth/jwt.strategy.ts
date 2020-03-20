import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {

  constructor(
      readonly configService: ConfigService,
      private readonly userService: UserService) {
    super({
      secretOrKey: configService.get<string>('jwt.secret'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  public async validate(payload: UserEntity) {
    // TODO: 使用校验码校验token有效性
    const user = await this.userService.getUserByUsername(payload.username);
    if(!user) {
      throw new UnauthorizedException();
    } else {
      return user;
    }
  }
}
