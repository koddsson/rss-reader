import html from '@web/rollup-plugin-html'
import esbuild from 'rollup-plugin-esbuild'
import {nodeResolve} from '@rollup/plugin-node-resolve'

export default {
  input: 'index.html',
  output: {dir: 'dist'},
  plugins: [nodeResolve(), esbuild(), html({input: 'index.html'})]
}
