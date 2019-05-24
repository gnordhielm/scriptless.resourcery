import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
// import replace from 'rollup-plugin-replace'
// import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: { file: 'public/resourcery.js', format: 'cjs', indent: false },
    external: [...Object.keys(pkg.peerDependencies || {})],
    plugins: [
      nodeResolve({
        customResolveOptions: {
          moduleDirectory: 'src',
        },
      }),
      babel({ exclude: 'node_modules/**' }),
    ],
  },

  // // ES
  // {
  //   input: 'src/index.js',
  //   output: { file: 'es/resourcery.js', format: 'es', indent: false },
  //   external: [...Object.keys(pkg.peerDependencies || {})],
  //   plugins: [babel()],
  // },

  // // ES for Browsers
  // {
  //   input: 'src/index.js',
  //   output: { file: 'es/resourcery.mjs', format: 'es', indent: false },
  //   plugins: [
  //     nodeResolve(),
  //     replace({
  //       'process.env.NODE_ENV': JSON.stringify('production'),
  //     }),
  //     terser({
  //       compress: {
  //         pure_getters: true,
  //         unsafe: true,
  //         unsafe_comps: true,
  //         warnings: false,
  //       },
  //     }),
  //   ],
  // },

  // // UMD Development
  // {
  //   input: 'src/index.js',
  //   output: {
  //     file: 'public/resourcery.js',
  //     format: 'umd',
  //     name: 'Resourcerer',
  //     indent: false,
  //   },
  //   plugins: [
  //     nodeResolve({
  //       jsnext: true,
  //     }),
  //     babel({
  //       exclude: 'node_modules/**',
  //     }),
  //     replace({
  //       'process.env.NODE_ENV': JSON.stringify('development'),
  //     }),
  //   ],
  // },

  // // UMD Production
  // {
  //   input: 'src/index.js',
  //   output: {
  //     file: 'public/resourcery.min.js',
  //     format: 'umd',
  //     name: 'Resourcerer',
  //     indent: false,
  //   },
  //   plugins: [
  //     nodeResolve({
  //       jsnext: true,
  //     }),
  //     babel({
  //       exclude: 'node_modules/**',
  //     }),
  //     replace({
  //       'process.env.NODE_ENV': JSON.stringify('production'),
  //     }),
  //     terser({
  //       compress: {
  //         pure_getters: true,
  //         unsafe: true,
  //         unsafe_comps: true,
  //         warnings: false,
  //       },
  //     }),
  //   ],
  // },
]
