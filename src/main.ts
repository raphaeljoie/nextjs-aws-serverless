import { mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as fse from 'fs-extra';

import {
  copyStaticPages,
  loadNextConfig,
  loadPackageJson,
  getNextConfigPath,
  Options,
  checkStandaloneBuild,
  DEFAULT_OPTIONS, clearOutDir,
} from './index';
import browseDirSync from './browseDirSync';

export default async function main(options : Options = {}) {
  const thisOptions = { ...DEFAULT_OPTIONS, options };
  thisOptions.source ||= process.cwd();

  const distPath = join(__dirname, '..', 'dist');
  const nextConfigPath = getNextConfigPath(thisOptions.source);
  const packageJson = loadPackageJson(thisOptions.source);
  const nextConfig = await loadNextConfig(nextConfigPath, packageJson.type);

  const { dotNextPath, standalonePath } = checkStandaloneBuild(thisOptions);

  const outPath = clearOutDir(thisOptions);

  const outLambdaPath = join(outPath, thisOptions.lambdaDir);
  mkdirSync(outLambdaPath);
  fse.default.copySync(standalonePath, outLambdaPath);

  const handlerDistExt = thisOptions.handlerType === 'module' || packageJson.type === 'module' ? '.mjs' : '.cjs';
  copyFileSync(join(distPath, `handler${handlerDistExt}`), join(outLambdaPath, thisOptions.handlerFilename));

  /// S3
  const outS3Path = join(outPath, thisOptions.s3Dir);

  // S3 Static files, referred as /_next/static/*
  const sourceStaticDirPath = join(dotNextPath, 'static');
  fse.default.copySync(sourceStaticDirPath, join(outS3Path, '_next', 'static'));

  // S3 Static pages
  copyStaticPages(standalonePath, outS3Path);

  // S3 Public files
  const sourcePublicDirPath = join(thisOptions.source, 'public');
  fse.default.copySync(sourcePublicDirPath, outS3Path);

  const publicFilesMetaPath = join(outLambdaPath, thisOptions.publicFilesManifest);
  const publicFiles = browseDirSync(sourcePublicDirPath)
    .map((filePath) => filePath.replace(sourcePublicDirPath, ''));
  writeFileSync(publicFilesMetaPath, JSON.stringify({
    version: 1,
    files: publicFiles,
  }), 'utf8');

  /// Terraform
  const sourceTerraformPath = join(distPath, 'terraform');
  fse.default.copySync(sourceTerraformPath, join(outPath, 'terraform'));
}
