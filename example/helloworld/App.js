import { h } from '../../dist/mini-vue.esm-browser.js'

const App = {
  setup() {
    return {
      msg: 'mini-vue',
    }
  },
  render() {
    return h('div', 'Hello ' + this.msg)
  },
}

export default App
