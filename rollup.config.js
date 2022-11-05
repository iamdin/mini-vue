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
  onwarn: (msg, warn) => {
    // 忽略 Circular 的错误
    if (!/Circular/.test(msg)) {
      warn(msg)
    }
  },
}
