import { User } from '@shared';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserProfileEntity } from './user-profile.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Controller, ClassSerializerInterceptor, UseInterceptors, UseGuards, Post, Body, Get } from '@nestjs/common';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@Controller('user')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

  constructor(
      private readonly userService: UserService) {

  }

  @Get()
  public async getUser(
      @User() user: UserEntity) {
    return user;
  }

  @Post('profile')
  @ApiBody({ type: UserProfileEntity })
  @ApiOperation({ summary: '更新用户档案' })
  public async updateUserProfile(
      @User() user: UserEntity,
      @Body() profile: UserProfileEntity) {
    return await this.userService.setUserProfile(user, profile);
  }

}
