import { extname, join, dirname } from 'path';
import { copyFileSync, mkdirSync } from 'fs';
import browseDirSync from './browseDirSync';

export default function copyStaticPages(standaloneDirPath: string, s3DirPath: string) {
  const pagesPath = join(standaloneDirPath, '.next', 'server', 'pages');
  browseDirSync(pagesPath)
    .filter((path) => extname(path) === '.html') // Only take .html files
    .forEach((path) => {
      const destPath = join(s3DirPath, path.replace(pagesPath, ''));
      const destDirPath = dirname(destPath);

      try {
        mkdirSync(destDirPath, { recursive: true });
      } catch (e) {
        if (e.errorCode !== 'EEXIST') throw e;
      }
      copyFileSync(path, destPath);
    });
}
