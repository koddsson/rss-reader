import {esbuildPlugin} from '@web/dev-server-esbuild'

export default {
  files: ['tests/**/*'],
  nodeResolve: true,
  plugins: [esbuildPlugin({ts: true, target: 'auto'})]
}
