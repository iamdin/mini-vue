import {
  h,
  ref,
  getCurrentInstance,
  nextTick,
} from '../../dist/mini-vue.esm-browser.js'

const App = {
  name: 'App',
  setup() {
    const count = ref(1)
    const instance = getCurrentInstance()

    const onClick = () => {
      for (let i = 0; i < 9; ++i) {
        count.value++
      }
      console.log(instance.vnode.el.innerHTML)
      nextTick(() => {
        console.log(instance.vnode.el.innerHTML)
      })
    }

    return {
      count,
      onClick,
    }
  },
  render() {
    const button = h('button', { onClick: this.onClick }, 'update')
    const p = h('p', {}, `count : ${this.count}`)

    return h('div', null, [button, p])
  },
}

export default App
