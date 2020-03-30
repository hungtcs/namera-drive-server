import fs from 'fs';
import md5 from 'md5';
import path from 'path';
import { Response } from 'express';
import { UserEntity } from '@user';
import { JwtAuthGuard } from '@auth';
import { LocalStorage } from 'src/app/storage/public_api';
import { ConfigService } from '@nestjs/config';
import { StorageOptions } from 'src/config';
import { User, Base64Param } from '@shared';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, UseInterceptors, ClassSerializerInterceptor, UseGuards, Get, NotFoundException, Res, ForbiddenException, Headers, HttpStatus } from '@nestjs/common';

@ApiTags('media')
@UseGuards(JwtAuthGuard)
@Controller('media')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class MediaController {

  constructor(
      private readonly config: ConfigService,
      private readonly storage: LocalStorage,) {

  }

  @Get('video/:videopath')
  public async getVideo(
      @Res() response: Response,
      @User() user: UserEntity,
      @Headers('range') range: string,
      @Base64Param('videopath') videopath: string) {
    if(!await this.storage.exists(user, videopath)) {
      throw new NotFoundException();
    }
    const stat = await this.storage.stat(user, videopath);
    if(!stat.isFile()) {
      throw new ForbiddenException('not a file');
    }
    if(range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      const headers = {
        'Content-Type': stat.mimeType,
        'Content-Range': `bytes ${ start }-${ end }/${ stat.size }`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
      }
      const fullpath = await this.storage.getAbsolutePath(user, videopath);
      const readStream = fs.createReadStream(fullpath, { start, end });
      response.writeHead(HttpStatus.PARTIAL_CONTENT, headers);
      readStream.on('open', () => readStream.pipe(response))
        .on('error', err => response.end(err));
    } else {
      const headers = {
        'Content-Type': stat.mimeType,
        'Content-Length': stat.size,
      }
      const fullpath = await this.storage.getAbsolutePath(user, videopath);
      const readStream = fs.createReadStream(fullpath);
      response.writeHead(HttpStatus.PARTIAL_CONTENT, headers);
      readStream.on('open', () => readStream.pipe(response))
        .on('error', err => response.end(err));
    }
  }

  @Get('thumbnail/:filepath')
  public async getThumbnail(
      @Res() response: Response,
      @User() user: UserEntity,
      @Base64Param('filepath') filepath: string) {
    const { thumbnailsPath } = this.config.get<StorageOptions>('storage');
    const thumbnailFilePath = path.join(thumbnailsPath, `${ md5(filepath) }.png`);
    if(!await this.storage.exists(user, thumbnailFilePath)) {
      response.sendFile(path.join(__dirname, 'assets/thumbnails/default.png'));
    } else {
      const stat = await this.storage.stat(user, thumbnailFilePath);
      const stream = await this.storage.readFile(user, thumbnailFilePath);
      response.writeHead(HttpStatus.OK, {
        'Content-Type': stat.mimeType,
        'Content-Length': stat.size,
      });
      stream.pipe(response);
    }
  }

}
