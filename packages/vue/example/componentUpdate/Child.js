import { h } from '../../dist/mini-vue.esm-browser.js'

export default {
  name: 'Child',
  setup() {
    return {}
  },
  render() {
    return h('div', {}, `child - props - msg: ${this.$props.msg}`)
  },
}
