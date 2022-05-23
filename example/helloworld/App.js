import { h } from '../../dist/mini-vue.esm-browser.js'

const App = {
  setup() {
    return {
      msg: 'mini-vue',
    }
  },
  render() {
    return h('div', { id: 'root', class: ['wrapper', 'red'] }, [
      h('p', { class: 'red' }, 'hi vue'),
      h('p', { class: 'blue' }, 'hhhh'),
    ])
  },
}

export default App
