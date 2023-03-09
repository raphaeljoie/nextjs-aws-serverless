import loadPackageJson from './loadPackageJson';
import loadNextConfig from './loadNextConfig';

const packageJson = loadPackageJson();
loadNextConfig(process.argv[2], packageJson.type)
  // eslint-disable-next-line no-console
  .then((nextConfig) => console.log(JSON.stringify({ packageJson, nextConfig })));
