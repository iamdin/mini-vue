import { h, ref } from '../../dist/mini-vue.esm-browser.js'

import Array2Text from './Array2Text.js'
import Array2Array from './Array2Array.js'
import Text2Text from './Text2Text.js'
import Text2Array from './Text2Array.js'

const App = {
  name: 'App',
  setup() {},
  render() {
    return h('div', { id: 1 }, [
      h('p', {}, '主页'),
      // 旧节点 Array 新节点 Text
      // h(Array2Text),
      // 旧节点 Text  新节点 Text
      // h(Text2Text),
      // 旧节点 Text  新节点 Array
      // h(Text2Array),
      // 旧节点 Array 新节点 Array
      h(Array2Array),
    ])
  },
}

export default App
