import fs from 'fs';
import md5 from 'md5'
import path from 'path'
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { Job } from "bull";
import { FileStat } from "@storage";
import { Processor, Process, OnQueueActive } from "@nestjs/bull";

@Processor('thumbnail')
export class ThumbnailProcessor {

  @Process()
  public async transcode(job: Job<{ absolutePath: string, thumbnailsPath: string, file: FileStat }>) {
    const { file, absolutePath, thumbnailsPath } = job.data;
    if(/image\/*/.test(file.mimeType)) {
      this.genPictureThumbnail(job, file, absolutePath, thumbnailsPath);
    } else if(/video\/*/.test(file.mimeType)) {
      this.genVideoThumbnail(job, file, absolutePath, thumbnailsPath);
    }
    return {};
  }

  @OnQueueActive()
  public onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${ JSON.stringify(job.data, null, 2) }...`,);
  }

  private genPictureThumbnail(job: Job, file: FileStat, absolutePath: string, thumbnailsPath: string) {
    sharp(absolutePath)
      .resize(200)
      .png()
      .toFile(path.join(thumbnailsPath, `${  md5(file.fullpath) }.png`), (err, info) => {
        if(err) {
          console.error(err);
        } else {
          console.log(info);
          job.progress(100);
        }
      });
  }

  public genVideoThumbnail(job: Job, file: FileStat, absolutePath: string, thumbnailsPath: string) {
    ffmpeg(absolutePath)
      .on('end', function() {
        job.progress(100);
      })
      .screenshots({
        size: '200x?',
        count: 1,
        folder: thumbnailsPath,
        filename: `${ md5(file.fullpath) }.png`,
      });
  }

}
