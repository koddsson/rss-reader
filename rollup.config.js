import html from '@web/rollup-plugin-html'
import esbuild from 'rollup-plugin-esbuild'

export default {
  input: 'index.html',
  output: {dir: 'dist'},
  plugins: [esbuild(), html({input: 'index.html'})]
}
