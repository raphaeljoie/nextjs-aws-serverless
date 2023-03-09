import { extname } from 'path';
import { NextConfig } from 'next';

export default function loadNextConfig(nextConfigPath, packageType : string = 'commonjs') : Promise<NextConfig> {
  switch (extname(nextConfigPath)) {
    case '.mjs':
      return import(nextConfigPath).then((r) => r.default);
    case '.js':
      return typeof require === 'undefined' || packageType === 'module'
        ? import(nextConfigPath).then((r) => r.default)
        : new Promise((resolver) => {
          resolver(require(nextConfigPath));
        });
    case '.cjs':
      return typeof require === 'undefined'
        ? import(nextConfigPath).then((r) => r.default)
        : new Promise((resolver) => {
          resolver(require(nextConfigPath));
        });
    default:
      throw Error(`Unexpected file extension ${extname(nextConfigPath)} for next config file path ${nextConfigPath}`);
  }
}
