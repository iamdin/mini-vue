import { h } from '../../dist/mini-vue.esm-browser.js'

window.self = null
const App = {
  setup() {
    return {
      msg: 'mini-vue h',
    }
  },
  render() {
    window.self = this
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
