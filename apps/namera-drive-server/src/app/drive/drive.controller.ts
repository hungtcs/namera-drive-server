import { Response } from 'express';
import { FileStat } from '@storage-engine';
import { MulterFile } from '../multer-storage/public_api';
import { UserEntity } from '@user';
import { JwtAuthGuard } from '@auth';
import { DriveService } from './drive.service';
import { FileUploadDTO } from '@multer-storage';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User, Base64Param } from '@shared';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Controller, UseGuards, UseInterceptors, ClassSerializerInterceptor, Post, Param, Get, NotFoundException, ConflictException, UploadedFiles, Delete, Query, ForbiddenException, Res, Put, Body, HttpStatus, HttpCode } from '@nestjs/common';

@ApiTags('Drive')
@Controller('drive')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class DriveController {

  constructor(
      private readonly driveService: DriveService) {

  }

  @Get('list/:dirpath')
  @ApiOperation({ summary: '获取下级文件列表' })
  public async getFiles(
      @User() user: UserEntity,
      @Base64Param('dirpath') dirpath: string) {
    if(!await this.driveService.isFileExists(user, dirpath)) {
      throw new NotFoundException();
    }
    const stat = await this.driveService.getFileStat(user, dirpath);
    if(stat.isFile() || stat.isSymbolicLink()) {
      throw new ForbiddenException(`(${ dirpath }) is not a directory`);
    }
    return await this.driveService.getFiles(user, dirpath);
  }

  @Get('stat/:filepath')
  @ApiResponse({ type: FileStat })
  @ApiOperation({ summary: '获取文件信息' })
  public async getFileState(
      @User() user: UserEntity,
      @Base64Param('filepath') filepath: string) {
    const exists = await this.driveService.isFileExists(user, filepath);
    if(!exists) {
      throw new NotFoundException('file not exists');
    } else {
      return await this.driveService.getFileStat(user, filepath);
    }
  }

  @Post('mkdir/:dirpath')
  @ApiResponse({ type: FileStat })
  @ApiOperation({ summary: '创建文件夹' })
  public async createDirectory(
      @User() user: UserEntity,
      @Base64Param('dirpath') dirpath: string) {
    const exists = await this.driveService.isFileExists(user, dirpath);
    if(exists) {
      throw new ConflictException('file already exists');
    }
    return await this.driveService.createDirectory(user, dirpath);
  }

  @Get('download/:filepath')
  @ApiOperation({ summary: '下载文件' })
  public async downloadFile(
      @Res() response: Response,
      @User() user: UserEntity,
      @Base64Param('filepath') filepath: string,) {
    if(!await this.driveService.isFileExists(user, filepath)) {
      throw new NotFoundException();
    }
    const fileStat = await this.driveService.getFileStat(user, filepath);
    if(fileStat.isDirectory()) {
      throw new ForbiddenException('暂不支持下载文件夹')
    } else if(fileStat.isFile()) {
      const readStream = await this.driveService.downloadFile(user, filepath);
      response.setHeader('Content-Type', fileStat.mimeType);
      response.setHeader('Content-Length', fileStat.size);
      // response.setHeader('Content-Disposition', `attachment; filename="${ encodeURIComponent(fileStat.name) }"`);
      response.setHeader('Content-Disposition', `inline; filename="${ encodeURIComponent(fileStat.name) }"`);
      readStream.pipe(response);
    }
  }

  @Post('upload/:destination')
  @ApiBody({ type: FileUploadDTO, description: '上传文件' })
  @ApiParam({ name: 'destination', description: '目标文件夹' })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传文件' })
  @UseInterceptors(FilesInterceptor('file'))
  public async uploadFiles(
      @User() user: UserEntity,
      @Base64Param('destination') destination: string,
      @UploadedFiles() files: Array<MulterFile>) {
    return await this.driveService.uploadFiles(user, destination, files);
  }

  @Delete('delete/:filename')
  @ApiOperation({ summary: '删除文件，直接从硬盘删除' })
  public async deleteFile(
      @User() user: UserEntity,
      @Base64Param('filename') filename: string,
      @Query('recursive') recursive: boolean = false) {
    if(await this.driveService.isFileExists(user, filename)) {
      return await this.driveService.deleteFile(user, filename, recursive);
    } else {
      throw new NotFoundException(`file (${ filename }) not exists`);
    }
  }

  @Post('delete-multiple')
  @ApiOperation({ summary: '删除多个文件，直接从硬盘删除' })
  @ApiBody({ type: String, isArray: true })
  public async deleteFiles(
      @User() user: UserEntity,
      @Body() filepaths: Array<string>) {
    return await this.driveService.deleteFiles(user, filepaths, true, true);
  }

  @Delete('remove/:filename')
  @ApiOperation({ summary: '移除文件，移动文件到回收站' })
  public async removeFile(
      @User() user: UserEntity,
      @Base64Param('filename') filename: string,) {
    if(!await this.driveService.isFileExists(user, filename)) {
      throw new NotFoundException(`file (${ filename }) not exists`);
    }
    return this.driveService.removeFile(user, filename);
  }

  @Post('remove-multiple')
  @ApiOperation({ summary: '移除文件，移动文件到回收站' })
  public async removeFiles(
      @User() user: UserEntity,
      @Body() filepaths: Array<string>) {
    return await this.driveService.removeFiles(user, filepaths);
  }

  @Put('restore/:trashId')
  @ApiOperation({ summary: '恢复已删除的文件' })
  public async restoreTrash(
      @User() user: UserEntity,
      @Param('trashId') trashId: string) {
    return await this.driveService.restoreTrash(user, trashId);
  }

}
