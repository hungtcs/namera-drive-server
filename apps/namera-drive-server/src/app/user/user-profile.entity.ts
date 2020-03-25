import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, OneToOne } from "typeorm";
import { BaseEntity, Gender, DateUtils } from "@shared";
import { IsString, IsEnum, IsMobilePhone, IsOptional } from "class-validator";
import { UserEntity } from "./user.entity";

@Entity({ name: 'namera_user_profile' })
export class UserProfileEntity extends BaseEntity {

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ title: '名', required: false })
  public firstName: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ title: '姓', required: false })
  public lastName: string;

  @Column({ nullable: true })
  @IsOptional()
  @ApiProperty({ title: '生日', type: Date, required: false })
  @Transform(value => DateUtils.parse(value), { toClassOnly: true })
  @Transform(value => DateUtils.format(value), { toPlainOnly: true })
  public birthday: Date;

  @IsEnum(Gender)
  @Column({ default: Gender.UNKNOW })
  @IsOptional()
  @ApiProperty({ title: '性别', enum: Gender, enumName: '性别', required: false })
  public gender: Gender;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ title: '头像', required: false })
  public avatar: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsMobilePhone('zh-CN')
  @ApiProperty({ title: '电话号码', required: false })
  public phoneNumber: string;

  @OneToOne(() => UserEntity, user => user.profile, { onDelete: 'CASCADE' })
  public user: UserEntity;

  constructor(that: Partial<UserProfileEntity> = {}) {
    super();
    Object.assign(this, that);
  }

}
