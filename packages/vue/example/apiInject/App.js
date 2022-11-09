import { h, provide, inject } from '../../dist/mini-vue.esm-browser.js'

const App = {
  name: 'App',
  setup() {
    provide('foo', 'fooApp')
    provide('bar', 'barApp')
  },
  render() {
    return h('div', null, [h('p', null, 'App'), h(Provider)])
  },
}

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooProvider')
    const foo = inject('foo')
    return { foo }
  },
  render() {
    return h('div', null, [
      h('span', null, 'Provider'),
      h('span', null, `  inject foo: ${this.foo}`),
      h(Consumer),
    ])
  },
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz', () => 'default baz', true)

    return {
      foo,
      bar,
      baz,
    }
  },
  render() {
    return h(
      'div',
      null,
      `Consumer foo: ${this.foo}, bar: ${this.bar}, baz: ${this.baz}`
    )
  },
}

export default App
