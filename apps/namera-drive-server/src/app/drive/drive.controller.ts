import { Response } from 'express';
import { FileStat } from '@storage';
import { UserEntity } from '@user';
import { JwtAuthGuard } from '@auth';
import { DriveService } from './drive.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User, Base64Param, FileUploadDTO, MulterFile } from '@shared';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Controller, UseGuards, UseInterceptors, ClassSerializerInterceptor, Post, Param, Get, UploadedFiles, Delete, Query, ForbiddenException, Res, Put, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { PathExistsPipe } from '@shared/pipes/public_api';

@ApiTags('Drive')
@Controller('drive')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class DriveController {

  constructor(
      private readonly driveService: DriveService,) {

  }

  @Get('list/:dirpath')
  @ApiOperation({ summary: '获取下级文件列表' })
  public async getFiles(
      @User() user: UserEntity,
      @Base64Param('dirpath', PathExistsPipe) dirpath: string) {
    const stat = await this.driveService.getFileStat(user, dirpath);
    if(stat.isFile()) {
      throw new ForbiddenException(`(${ dirpath }) is not a directory`);
    }
    return await this.driveService.getFiles(user, dirpath);
  }

  @Get('stat/:filepath')
  @ApiResponse({ type: FileStat })
  @ApiOperation({ summary: '获取文件信息' })
  public async getFileState(
      @User() user: UserEntity,
      @Base64Param('filepath', PathExistsPipe) filepath: string) {
    return await this.driveService.getFileStat(user, filepath);
  }

  @Post('mkdir/:dirpath')
  @ApiResponse({ type: FileStat })
  @ApiOperation({ summary: '创建文件夹' })
  public async createDirectory(
      @User() user: UserEntity,
      @Base64Param('dirpath') dirpath: string) {
    return await this.driveService.createDirectory(user, dirpath);
  }

  @Put('move/:sourcepath/:targetpath')
  public async moveFile(
      @User() user: UserEntity,
      @Base64Param('sourcepath', PathExistsPipe) sourcepath: string,
      @Base64Param('targetpath') targetpath: string) {
    return await this.driveService.moveFile(user, sourcepath, targetpath);
  }

  @Get('download/:filepath')
  @ApiOperation({ summary: '下载文件' })
  public async downloadFile(
      @Res() response: Response,
      @User() user: UserEntity,
      @Base64Param('filepath', PathExistsPipe) filepath: string,) {
    const fileStat = await this.driveService.getFileStat(user, filepath);
    if(fileStat.isDirectory()) {
      throw new ForbiddenException('暂不支持下载文件夹')
    } else if(fileStat.isFile()) {
      const readStream = await this.driveService.downloadFile(user, filepath);
      response.setHeader('Content-Type', fileStat.mimeType);
      response.setHeader('Content-Length', fileStat.size);
      response.setHeader('Content-Disposition', `attachment; filename="${ encodeURIComponent(fileStat.name) }"`);
      // response.setHeader('Content-Disposition', `inline; filename="${ encodeURIComponent(fileStat.name) }"`);
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
      @Base64Param('destination', PathExistsPipe) destination: string,
      @UploadedFiles() files: Array<MulterFile>) {
    return await this.driveService.uploadFiles(user, destination, files);
  }

  @Delete('delete/:filename')
  @ApiOperation({ summary: '删除文件，直接从硬盘删除' })
  public async deleteFile(
      @User() user: UserEntity,
      @Base64Param('filename', PathExistsPipe) filename: string,
      @Query('recursive') recursive: boolean = false) {
    return await this.driveService.deleteFile(user, filename, recursive);
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
      @Base64Param('filename', PathExistsPipe) filename: string,) {
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
