import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { UserProfileEntity } from './user-profile.entity';

@Injectable()
export class UserService {

  constructor(
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

  public async createUser(user: UserEntity) {
    user.id = null;
    return await this.userRepository.save(user);
  }

  public async updateUser(user: UserEntity) {
    return await this.userRepository.save(user);
  }

  public async setUserProfile(user: UserEntity, profile: UserProfileEntity) {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const userProfileRepository = entityManager.getRepository(UserProfileEntity);
      user = await userRepository.findOne({
        where: {
          id: user.id
        },
        relations: ['profile'],
      });
      if(user.profile) {
        user.profile = Object.assign(user.profile, profile);
      }
      user.profile = await userProfileRepository.save(user.profile);
      return user.profile;
    });
  }

  public async getUserProfile(user: UserEntity) {
    user = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
      relations: ['profile'],
    });
    return user.profile;
  }

}
