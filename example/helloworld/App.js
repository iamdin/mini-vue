import { h } from '../../dist/mini-vue.esm-browser.js'

const App = {
  name: 'App',
  setup() {
    return {
      msg: 'mini-vue h',
    }
  },
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['wrapper', 'red'],
        onClick() {
          console.log('click')
        },
        onMousedown() {
          console.log('mouse down')
        },
      },
      [h('p', { class: 'red' }, `hi ${this.msg}`)]
    )
  },
}

export default App
