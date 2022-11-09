import { h } from '../../dist/mini-vue.esm-browser.js'

export const Foo = {
  setup(props, { emit }) {
    // props.count
    console.log(props, emit)

    const emitAdd = () => {
      console.log('emitAdd')
      emit('add', 'add args')
      emit('add-foo', 'add foo args')
    }
    return {
      emitAdd,
    }
  },
  render() {
    const bar = h('button', { onClick: this.emitAdd }, 'emitAdd')
    const foo = `foo ${this.count}`
    return h('div', {}, [foo, bar])
  },
}
