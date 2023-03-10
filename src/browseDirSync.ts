import { readdirSync, Dirent } from 'fs';
import { join } from 'path';

export default function browseDirSync(dirPath: string, arrayOfFiles: string[] = []) : string[] {
  const files: Dirent[] = readdirSync(dirPath, { withFileTypes: true });

  files.forEach((file) => {
    if (file.isDirectory()) {
      browseDirSync(join(dirPath, file.name), arrayOfFiles);
    } else {
      arrayOfFiles.push(join(dirPath, file.name));
    }
  });

  return arrayOfFiles;
}
