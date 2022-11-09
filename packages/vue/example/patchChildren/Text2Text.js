import { h, ref } from '../../dist/mini-vue.esm-browser.js'

const prev = 'prev children'
const next = 'next children'

export default {
  name: 'Text2Text',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange

    return { isChange }
  },
  render() {
    return this.isChange ? h('div', {}, next) : h('div', {}, prev)
  },
}
