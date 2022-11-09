import typescript from '@rollup/plugin-typescript'

export default {
  input: './packages/vue/src/index.ts',
  output: [
    // cjs
    { format: 'cjs', file: 'packages/vue/dist/mini-vue.cjs.js' },
    // esm
    { format: 'es', file: 'packages/vue/dist/mini-vue.esm-browser.js' },
  ],
  plugins: [typescript()],
  onwarn: (msg, warn) => {
    // 忽略 Circular 的错误
    if (!/Circular/.test(msg)) {
      warn(msg)
    }
  },
}
