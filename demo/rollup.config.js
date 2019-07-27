import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import bundleSize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

const isProduction = !process.env.ROLLUP_WATCH;

const plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VUE_ENV': JSON.stringify('browser')
  }),
  resolve({browser: true,} ),
  bundleSize(),
  commonjs(),
  vue({
    template: {
      isProduction,
      compilerOptions: { preserveWhitespace: false }
    },
    css: true
  }),
  buble()
];

export default {
  //external,
  plugins,
  input: 'src/main.js',
  output: {
    //globals,
    file: 'dist/assets/bundle.js',
    format: 'umd'
  }
};