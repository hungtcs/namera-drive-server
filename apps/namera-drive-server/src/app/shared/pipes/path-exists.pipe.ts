import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserEntity } from '@user';
import { LocalStorage } from 'src/app/storage/public_api';
import { ArgumentMetadata, Injectable, PipeTransform, Inject, NotFoundException } from '@nestjs/common';

@Injectable()
export class PathExistsPipe implements PipeTransform {

  constructor(
      private readonly storageEngine: LocalStorage,
      @Inject(REQUEST) private readonly request: Request) {

  }

  public async transform(value: string, metadata: ArgumentMetadata) {
    if(await this.storageEngine.exists(this.request.user as UserEntity, value)) {
      return value;
    } else {
      throw new NotFoundException(`path(${ value }) not exists`);
    }
  }

}
