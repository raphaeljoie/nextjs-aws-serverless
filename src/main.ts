import { mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import * as fse from 'fs-extra';

import {
  loadNextConfig,
  loadPackageJson,
  getNextConfigPath,
  Options,
  checkStandaloneBuild,
  DEFAULT_OPTIONS, clearOutDir,
} from './index';

export default async function main(options : Options = {}) {
  const thisOptions = { ...DEFAULT_OPTIONS, options };
  thisOptions.source ||= process.cwd();

  const nextConfigPath = getNextConfigPath(thisOptions.source);
  const packageJson = loadPackageJson(thisOptions.source);
  const nextConfig = await loadNextConfig(nextConfigPath, packageJson.type);

  const { dotNextPath, standalonePath } = checkStandaloneBuild(thisOptions);

  const outPath = clearOutDir(thisOptions);

  const outLambdaPath = join(outPath, thisOptions.lambdaDir);
  mkdirSync(outLambdaPath);
  fse.default.copySync(standalonePath, outLambdaPath);

  const handlerDistExt = thisOptions.handlerType === 'module' || packageJson.type === 'module' ? '.mjs' : '.cjs';
  copyFileSync(join(__dirname, '..', 'dist', `handler${handlerDistExt}`), join(outLambdaPath, thisOptions.handlerFilename));

  const sourceStaticDirPath = join(dotNextPath, 'static');
  const sourcePublicDirPath = join(thisOptions.source, 'public');

  const outStaticPath = join(outPath, thisOptions.staticDir);
  fse.default.copySync(sourceStaticDirPath, join(outStaticPath, '_next', 'static'));
  fse.default.copySync(sourcePublicDirPath, outStaticPath);

  const sourceTerraformPath = join(__dirname, '..', 'dist', 'terraform');
  fse.default.copySync(sourceTerraformPath, join(outPath, 'terraform'));
}
