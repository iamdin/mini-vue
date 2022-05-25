import { h } from '../../dist/mini-vue.esm-browser.js'

export const Foo = {
  setup(props) {
    // props.count
    console.log(props)
    return {}
  },
  render() {
    return h('div', {}, `foo ${this.count}`)
  },
}
