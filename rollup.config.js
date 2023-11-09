import {rollupPluginHTML as html} from '@web/rollup-plugin-html'
import esbuild from 'rollup-plugin-esbuild'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import {copy} from '@web/rollup-plugin-copy'

export default {
  input: 'index.html',
  output: {dir: 'dist'},
  plugins: [
    nodeResolve(),
    esbuild({target: 'esnext'}),
    html({input: 'index.html'}),
    copy({patterns: './service-worker.js'}),
  ],
}
