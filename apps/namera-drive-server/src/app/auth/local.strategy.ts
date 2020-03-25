import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from '../user/public_api';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {

  constructor(
      private readonly userService: UserService) {
    super();
  }

  public async validate(username: string, password: string): Promise<any> {
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new UnauthorizedException();
    } else if(password !== user.password) {
      throw new UnauthorizedException();
    } else {
      return user;
    }
  }

}
