import { join } from 'path';
import { rmSync, mkdirSync } from 'fs';
import { Options } from './Options';

export default function clearOutDir(options: Options) : string {
  const outPath = join(options.source, options.outDir);
  rmSync(outPath, {
    recursive: true,
    force: true,
  });
  mkdirSync(outPath);

  return outPath;
}
