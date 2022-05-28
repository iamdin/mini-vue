import { createTextVNode, h } from '../../dist/mini-vue.esm-browser.js'
import Foo from './Foo.js'

const App = {
  name: 'App',
  render() {
    const bar = h('div', {}, 'bar')
    // h('p', {}, 'slot foo') 作为 slot 在 Foo 组件中渲染
    const foo = h(
      Foo,
      {},
      // 使用对象的方式渲染插槽
      {
        header: ({ age }) => {
          return [
            h('p', { name: 'header' }, `slot foo header ${age}`),
            // 使用 createTextVNode 渲染组件中的纯文本节点
            createTextVNode('hello'),
          ]
        },
        footer: () => h('p', { name: 'footer' }, 'slot foo footer'),
      }
    )
    const baz = h('p', {}, [h('span', {}, 'baz1'), h('span', {}, 'baz2')])
    return h('div', {}, [bar, foo, baz])
  },
  setup() {
    return {
      msg: 'mini-vue slots',
    }
  },
}

export default App
