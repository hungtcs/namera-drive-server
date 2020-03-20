import { Transform } from 'class-transformer';
import { DateUtils } from '@shared/utils/date.utils';
import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { BaseEntity as TypeOrmBaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity extends TypeOrmBaseEntity {

  @IsNumber()
  @IsOptional()
  @PrimaryGeneratedColumn()
  public id: number;

  @IsDate()
  @IsOptional()
  @CreateDateColumn()
  @Transform(value => DateUtils.parse(value), { toClassOnly: true })
  @Transform(value => DateUtils.format(value), { toPlainOnly: true })
  public createDate: Date;

  @IsDate()
  @IsOptional()
  @Transform(value => DateUtils.parse(value), { toClassOnly: true })
  @Transform(value => DateUtils.format(value), { toPlainOnly: true })
  @UpdateDateColumn()
  public updateDate: Date;

}
