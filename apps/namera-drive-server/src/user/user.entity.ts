import { BaseEntity } from "@shared";
import { UserProfileEntity } from "./user-profile.entity";
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { Exclude } from "class-transformer";

@Entity({ name: 'namera_user' })
export class UserEntity extends BaseEntity {

  @Column()
  @IsEmail()
  public email: string;

  @Column({ unique: true })
  @IsNotEmpty()
  public username: string;

  @Column()
  @IsNotEmpty()
  @Exclude({ toPlainOnly: true })
  public password: string;

  @OneToOne(() => UserProfileEntity)
  @JoinColumn()
  public profile: UserProfileEntity;

  @Column({ default: false })
  public disabled: boolean;

  constructor(that: Partial<UserEntity> = {}) {
    super();
    Object.assign(this, that);
  }

}
