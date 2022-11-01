import {esbuildPlugin} from '@web/dev-server-esbuild'

export default {
  watch: true,
  nodeResolve: true,
  plugins: [esbuildPlugin({ts: true, target: 'auto'})]
}
