import crypto from 'crypto';

// export interface ConflictStrategy {
//   file: 'skip' | 'replace' | 'rename',
//   directory: 'merge' | 'rename' | 'skip',
// }

export class FileUtils {

  public static generateRandomFilename() {
    const buffer = crypto.randomBytes(16);
    return buffer.toString('hex');
  }

  // public static async moveFiles(files: Array<string>, target: string, strategy: ConflictStrategy) {
  //   const targetChilds = await promisify(fs.readdir)(target);
  //   for(let file of files) {
  //     const stat = await promisify(fs.stat)(file);
  //     const filename = path.basename(file);
  //     if(targetChilds.includes(filename)) {
  //       if(stat.isFile()) {
  //         if(strategy.file === 'skip') {

  //         } else if(strategy.file === 'replace') {
  //           await promisify(fs.rename)(file, path.join(target, filename));
  //         } else if(strategy.file === 'rename') {
  //           await promisify(fs.rename)(file, path.join(target, `${ filename }-${ FileUtils.generateRandomFilename() }`));
  //         }
  //       } else if(stat.isDirectory()) {
  //         if(strategy.directory === 'skip') {

  //         } else if(strategy.directory === 'merge') {
  //           const childFiles = (await promisify(fs.readdir)(path.join(file))).map(_childFile => `${ file }/${ _childFile }`);
  //           await FileUtils.moveFiles(childFiles, path.join(target, filename), strategy);
  //         } else if(strategy.directory === 'rename') {
  //           await promisify(fs.rename)(file, path.join(target, `${ filename }-${ FileUtils.generateRandomFilename() }`));
  //         }
  //       }
  //     } else {
  //       await promisify(fs.rename)(file, path.join(target, filename));
  //     }
  //   }
  // }

}
