import { extname, join, dirname } from 'path';
import { copyFileSync, mkdirSync } from 'fs';
import browseDirSync from './browseDirSync';

export default function copyStaticPages(standalonePath, s3Path) {
  const pagesPath = join(standalonePath, '.next', 'server', 'pages');
  browseDirSync(pagesPath)
    .filter((path) => ['.htm', '.html'].includes(extname(path)))
    .forEach((path) => {
      const destPath = join(s3Path, path.replace(pagesPath, ''));
      const destDirPath = dirname(destPath);

      try {
        mkdirSync(destDirPath, { recursive: true });
      } catch (e) {
        if (e.errorCode !== 'EEXIST') throw e;
      }
      copyFileSync(path, destPath);
    });
}
