import { Module } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileEntity } from './user-profile.entity';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
    ]),
  ],
  exports: [
    UserService,
  ],
  providers: [
    UserService,
  ],
  controllers: [UserController],
})
export class UserModule {

}
