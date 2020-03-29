import fs from 'fs';
import { Response } from 'express';
import { JwtAuthGuard } from '@auth';
import { User, Base64Param } from '@shared';
import { UserEntity } from '@user';
import { StorageEngine } from '@storage-engine';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, UseInterceptors, ClassSerializerInterceptor, UseGuards, Get, NotFoundException, Res, ForbiddenException, Headers, HttpStatus } from '@nestjs/common';

@ApiTags('media')
@UseGuards(JwtAuthGuard)
@Controller('media')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class MediaController {

  constructor(
      private readonly storageEngine: StorageEngine,) {

  }

  @Get('video/:videopath')
  public async getVideo(
      @Res() response: Response,
      @User() user: UserEntity,
      @Headers('range') range: string,
      @Base64Param('videopath') videopath: string) {
    if(!await this.storageEngine.exists(user, videopath)) {
      throw new NotFoundException();
    }
    const stat = await this.storageEngine.stat(user, videopath);
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
      const fullpath = await this.storageEngine.getAbsolutePath(user, videopath);
      const readStream = fs.createReadStream(fullpath, { start, end });
      response.writeHead(HttpStatus.PARTIAL_CONTENT, headers);
      readStream.on('open', () => readStream.pipe(response))
        .on('error', err => response.end(err));
    } else {
      const headers = {
        'Content-Type': stat.mimeType,
        'Content-Length': stat.size,
      }
      const fullpath = await this.storageEngine.getAbsolutePath(user, videopath);
      const readStream = fs.createReadStream(fullpath);
      response.writeHead(HttpStatus.PARTIAL_CONTENT, headers);
      readStream.on('open', () => readStream.pipe(response))
        .on('error', err => response.end(err));
    }
  }

}
