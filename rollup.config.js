import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import executable from 'rollup-plugin-executable';

const config = [
  {
    input: 'src/handler/handler.ts',
    output: [
      {
        file: 'dist/handler.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/handler.min.cjs',
        format: 'cjs',
        sourcemap: true,
        plugins: [terser()],
      },
      {
        file: 'dist/handler.mjs',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [typescript()],
  }, {
    input: 'src/cli.ts',
    output: [
      {
        banner: '#!/usr/bin/env node',
        file: 'bin/cli.cjs', // use .cjs to force common js
        format: 'cjs', // Using CJS because we need __dirname
        sourcemap: true,
      },
    ],
    plugins: [typescript(), executable()],
  },
  {
    input: 'src/cli-test.ts',
    output: ['cjs', 'esm'].map((format) => (
      {
        file: `tests/build/cli.${format === 'esm' ? 'mjs' : format}`,
        format,
        banner: '#!/usr/bin/env node',
      }
    )),
    plugins: [typescript(), executable()],
  },
];

export default config;
