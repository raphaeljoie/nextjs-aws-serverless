export type Options = {
  source?: string,
  dotNextDir?: string,
  standaloneDir?: string,
  outDir?: string,
  lambdaDir?: string,
  staticDir?: string,
  terraformDir?: string,
  handlerType?: string | null
  handlerFilename?: string
};

export const DEFAULT_OPTIONS: Options = {
  dotNextDir: '.next',
  standaloneDir: 'standalone',
  outDir: '.next-standalone',
  lambdaDir: 'lambda',
  staticDir: 'static',
  terraformDir: 'terraform',
  // Take from package.json
  handlerType: null,
  handlerFilename: 'handler.js',
};
