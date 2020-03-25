import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/public_api';

@Injectable()
export class AuthService {

  constructor(
      private readonly jwtService: JwtService) {

  }

  public async signToken(user: UserEntity) {
    const { id, username } = user;
    return this.jwtService.sign({ id, username });
  }

}
