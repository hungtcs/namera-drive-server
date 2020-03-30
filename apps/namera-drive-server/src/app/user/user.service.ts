import { UserEntity } from './user.entity';
import { Injectable } from '@nestjs/common';
import { LocalStorage } from 'src/app/storage/public_api';
import { UserProfileEntity } from './user-profile.entity';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';

@Injectable()
export class UserService {

  constructor(
      private readonly storageEngine: LocalStorage,
      @InjectEntityManager() private readonly entityManager: EntityManager,
      @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
      @InjectRepository(UserProfileEntity) private readonly userProfileRepository: Repository<UserProfileEntity>) {

  }

  public async getUser(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  public async getUserByUsername(username: string) {
    return await this.userRepository.findOne({
      where: {
        username,
      },
      relations: ['profile'],
    });
  }

  public async createUser(user: UserEntity): Promise<UserEntity> {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const userProfileRepository = entityManager.getRepository(UserProfileEntity);

      const profile = new UserProfileEntity();
      user.profile = await userProfileRepository.save(profile);
      user.id = null;
      user = await userRepository.save(user);
      await this.initUserDirectory(user);
      return user;
    });
  }

  public async updateUser(user: UserEntity) {
    return await this.userRepository.save(user);
  }

  public async setUserProfile(user: UserEntity, profile: UserProfileEntity) {
    const _profile = await this.userProfileRepository.findOne({ user });
    await this.userProfileRepository.update(_profile.id, profile);
    return await this.userProfileRepository.findOne(_profile.id);
  }

  public async getUserProfile(user: UserEntity) {
    return await this.userProfileRepository.findOne({ user });
  }

  private async initUserDirectory(user: UserEntity): Promise<void> {
    await this.storageEngine.initUser(user);
  }

}
