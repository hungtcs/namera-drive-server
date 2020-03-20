import { User } from '@shared';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserProfileEntity } from './user-profile.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Controller, ClassSerializerInterceptor, UseInterceptors, UseGuards, Post, Body } from '@nestjs/common';

@ApiTags('User')
@UseGuards(AuthGuard('jwt'))
@Controller('user')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

  constructor(
      private readonly userService: UserService) {

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
