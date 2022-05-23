import typescript from '@rollup/plugin-typescript'

export default {
  input: './src/index.ts',
  output: [
    // cjs
    { format: 'cjs', file: 'dist/mini-vue.cjs.js' },
    // esm
    { format: 'es', file: 'dist/mini-vue.esm-browser.js' },
  ],
  plugins: [typescript()],
}
