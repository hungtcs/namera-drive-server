import fs from 'fs';
import md5 from 'md5'
import path from 'path'
import sharp from 'sharp';
import { Job } from "bull";
import { FileStat } from "@storage";
import { Processor, Process, OnQueueActive } from "@nestjs/bull";

@Processor('thumbnail')
export class ThumbnailProcessor {

  @Process()
  public async transcode(job: Job<{ absolutePath: string, thumbnailsPath: string, file: FileStat }>) {
    const { file, absolutePath, thumbnailsPath } = job.data;
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
    return {};
  }

  @OnQueueActive()
  public onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${ JSON.stringify(job.data, null, 2) }...`,);
  }

}
