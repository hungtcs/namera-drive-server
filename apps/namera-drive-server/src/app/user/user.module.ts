import { Module } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserProfileEntity } from './user-profile.entity';
import { StorageEngineModule } from '@storage-engine';

@Module({
  imports: [
    StorageEngineModule,
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
