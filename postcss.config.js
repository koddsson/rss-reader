import postcssJitProps from 'postcss-jit-props'
import OpenProps from 'open-props'
import atImport from 'postcss-import'

export default {
  plugins: [atImport(), postcssJitProps(OpenProps)]
}
