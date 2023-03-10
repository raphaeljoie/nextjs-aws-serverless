import { extname, join } from 'path';
import { copyFileSync } from 'fs';
import browseDirSync from './browseDirSync';

export default function copyStaticPages(standalonePath, s3Path) {
  const pagesPath = join(standalonePath, '.next', 'server', 'pages');
  browseDirSync(pagesPath)
    .filter((path) => ['.htm', '.html'].includes(extname(path)))
    .forEach((path) => {
      copyFileSync(path, join(s3Path, path.replace(pagesPath, '')));
    });
}
