export type Options = {
  source?: string,
  dotNextDir?: string,
  standaloneDir?: string,
  outDir?: string,
  lambdaDir?: string,
  s3Dir?: string,
  terraformDir?: string,
  handlerType?: string | null
  handlerFilename?: string
};

export const DEFAULT_OPTIONS: Options = {
  dotNextDir: '.next',
  standaloneDir: 'standalone',
  outDir: '.next-serverless',
  lambdaDir: 'lambda',
  s3Dir: 's3',
  terraformDir: 'terraform',
  // Take from package.json
  handlerType: null,
  handlerFilename: 'handler.js',
};
