import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

export default {
  input: './src/index.ts',
  output: [
    // cjs
    { format: 'cjs', file: pkg.main },
    // esm
    { format: 'es', file: pkg.module },
  ],
  plugins: [typescript()],
}
