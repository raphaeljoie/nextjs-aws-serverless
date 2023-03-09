import { join } from 'path';
import { existsSync } from 'fs';

export default function getNextConfigPath(dir: string = null) : string {
  const searchDir = dir || process.cwd();

  const nextConfigExtensions = ['mjs', 'cjs', 'js'];
  const nextConfigPath = nextConfigExtensions
    .map((ext) => `next.config.${ext}`)
    .map((file) => join(searchDir, file))
    .find((filePath) => existsSync(filePath));

  if (!nextConfigPath) throw new Error(`Unable to find a next.config.{${nextConfigExtensions.join('|')}} in ${searchDir}`);

  return nextConfigPath;
}
