import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { Options } from './Options';

export default function checkStandaloneBuild(options: Options) : {
  dotNextPath: string
  standalonePath: string
} {
  const dotNextPath = join(options.source, options.dotNextDir);

  if (!existsSync(dotNextPath)) throw new Error('.next doesn\'t seem to exist in current path. Make sure to executed next build before.');
  if (!statSync(dotNextPath).isDirectory()) {
    throw new Error('.next is expected to be a directory');
  }

  const standalonePath = join(dotNextPath, options.standaloneDir);
  if (!existsSync(standalonePath)) throw new Error('Can\'t find standalone dir in .next. Make sure to have output: \'standalone\' in next.config.js');
  if (!statSync(standalonePath).isDirectory()) {
    throw new Error('.next/standalone is expected to be a directory');
  }

  return { dotNextPath, standalonePath };
}
