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
      // `hi, ${this.msg}`
      [h('p', { class: 'red' }, 'hi vue'), h('p', { class: 'blue' }, 'hhhh')]
    )
  },
}

export default App
