import { h, ref } from '../../dist/mini-vue.esm-browser.js'

const prev = [h('div', {}, 'A'), h('div', {}, 'B')]
const next = 'next children'

export default {
  name: 'Array2Text',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange

    return { isChange }
  },
  render() {
    return this.isChange ? h('div', {}, next) : h('div', {}, prev)
  },
}
