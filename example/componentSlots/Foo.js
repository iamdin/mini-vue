import { h, renderSlot } from '../../dist/mini-vue.esm-browser.js'

const Foo = {
  render() {
    const foo = h('p', {}, 'foo')
    // Foo -> vnode.children
    // 通过 $slots 访问 Foo 中的子组件
    console.log(this.$slots)
    // 具名插槽
    return h('div', {}, [
      // 通过 renderSlot 函数，渲染具名插槽
      renderSlot(this.$slots, 'header', {
        age: 1,
      }),
      foo,
      renderSlot(this.$slots, 'footer'),
    ])
  },
  setup() {
    return {}
  },
}

export default Foo
