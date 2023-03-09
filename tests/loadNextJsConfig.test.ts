import { describe, expect, test } from '@jest/globals';
import { exec } from 'child_process';
import { join } from 'path';
import * as fs from 'fs';

const testDir = 'tests';
const testBuildPath = join(testDir, 'build');
const testContextsPath = join(testDir, 'contexts', 'loadNextJsConfig');
const testContexts = ['cjs', 'esm'];
const testClis = ['cli.mjs', 'cli.cjs'];
const nextConfigFiles = ['cjs', 'mjs', 'js'].map((ext) => `next.config.${ext}`);
const executables = ['node ', ''];

executables.forEach((exe) => {
  testContexts.forEach((context) => {
    testClis.forEach((cli) => {
      nextConfigFiles.forEach((nextConfigFile) => {
        const cliPath = join(process.cwd(), testBuildPath, cli);
        const nextConfigPath = join(process.cwd(), testContextsPath, context, nextConfigFile);
        const cliCwd = join(process.cwd(), testContextsPath, context);

        // @ts-ignore
        const packageJson = JSON.parse(fs.readFileSync(join(process.cwd(), testContextsPath, context, 'package.json')));

        test(`test ${exe}${cli} in ${context} package to load ${nextConfigFile}`, async () => {
          const testCliOutput = await new Promise<string>((resolve, reject) => {
            exec(
              `${exe}${cliPath} ${nextConfigPath}`,
              { cwd: cliCwd },
              (error, stdout, stderr) => {
                if (error || `${stderr}`.length > 0) {
                  reject(error || `${stderr}`);
                } else {
                  resolve(`${stdout}`);
                }
              },
            );
          });

          const parsed = JSON.parse(testCliOutput);

          expect(parsed.packageJson).toStrictEqual(packageJson);
        });
      });
    });
  });
});
