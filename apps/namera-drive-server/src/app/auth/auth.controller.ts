import { User } from '@shared';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpEntity } from './sign-up.entity';
import { classToPlain } from 'class-transformer';
import { UserService, UserEntity } from '@user';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { Controller, Post, UseInterceptors, ClassSerializerInterceptor, Put, Body, ConflictException, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { SignInEntity } from './sign-in.entity';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {

  constructor(
      private readonly authService: AuthService,
      private readonly userService: UserService) {

  }

  @Put('sign-up')
  @ApiOperation({ summary: '注册' })
  @ApiBody({ type: SignUpEntity })
  public async signUp(@Body() signUpEntity: SignUpEntity) {
    const user = await this.userService.getUserByUsername(signUpEntity.username);
    if(user) {
      throw new ConflictException('用户已存在');
    } else {
      const user = await this.userService.createUser(new UserEntity({
        email: signUpEntity.email,
        username: signUpEntity.username,
        password: signUpEntity.password,
      }));
      return user;
    }
  }

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: SignInEntity })
  @ApiOperation({ summary: '登录' })
  public async signIn(
      @Res() response: Response,
      @User() user: UserEntity) {
    const token = await this.authService.signToken(user);
    response.cookie('token', token);
    response.status(HttpStatus.OK);
    response.send({
      token,
      user: classToPlain(user),
    });
  }

}
