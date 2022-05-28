import { h, getCurrentInstance } from '../../dist/mini-vue.esm-browser.js'
import Foo from './Foo.js'

const App = {
  name: 'App',
  setup() {
    const currentInstance = getCurrentInstance()
    console.log(currentInstance)
    return {}
  },
  render() {
    // debugger
    return h('div', null, [h('p', null, 'App'), h(Foo)])
  },
}

export default App
