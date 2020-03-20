import { Strategy } from 'passport-local';
import { UserService } from 'src/user/user.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from "@nestjs/common";

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
