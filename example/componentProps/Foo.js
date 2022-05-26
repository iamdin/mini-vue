import { h } from '../../dist/mini-vue.esm-browser.js'

export const Foo = {
  setup(props) {
    console.log(props)
    return {}
  },
  render() {
    const bar = h('button', 'emitAdd')
    const foo = `foo ${this.count}`
    return h('div', {}, [foo, bar])
  },
}
