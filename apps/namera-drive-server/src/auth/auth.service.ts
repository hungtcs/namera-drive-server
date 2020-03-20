import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { classToPlain } from 'class-transformer';

@Injectable()
export class AuthService {

  constructor(
      private readonly jwtService: JwtService) {

  }

  public async signToken(user: UserEntity) {
    return this.jwtService.sign(classToPlain(user));
  }

}
