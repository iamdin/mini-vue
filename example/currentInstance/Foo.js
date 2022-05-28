import { getCurrentInstance, h } from '../../dist/mini-vue.esm-browser.js'

const Foo = {
  name: 'Foo',
  setup() {
    const currentInstance = getCurrentInstance()
    console.log(currentInstance)
    return {}
  },
  render() {
    return h('p', null, 'Foo')
  },
}

export default Foo
