import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { plainToClass } from 'class-transformer';
import { JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface MinioStorageEngineOptions {
  type: 'minio';
  username: string;
  password: string;
}
export interface LocalStorageEngineOptions {
  type: 'local';
  root: string;
}

export interface StorageOptions<T = MinioStorageEngineOptions | LocalStorageEngineOptions> {
  engine: T;
  trashPath: string;
  uploadPath: string;
}

export class Config {
  jwt: JwtModuleOptions;
  storage: StorageOptions;
  typeorm: TypeOrmModuleOptions;
}

export default () => {
  const fileContent = fs.readFileSync(path.join(__dirname, 'assets/config.yaml'), { encoding: 'utf-8' });
  const object = yaml.parse(fileContent);
  return plainToClass(Config, object);
};
