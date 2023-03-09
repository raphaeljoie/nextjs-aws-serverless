import { readFileSync } from 'fs';

// @ts-ignore
const loadPackageJson = (dir: string = null) : { type: string } => JSON.parse(readFileSync('package.json'));

export default loadPackageJson;
