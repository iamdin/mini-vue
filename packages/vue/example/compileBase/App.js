import { ref } from '../../dist/mini-vue.esm-browser.js'

const App = {
  name: 'App',
  template: `<h1>hi, {{ count }}</h1>`,
  setup() {
    const count = (window.count = ref(1))
    return {
      msg: 'mini-vue ',
      count,
    }
  },
}

export default App
