import { h, ref } from '../../dist/mini-vue.esm-browser.js'

const App = {
  name: 'App',
  setup() {
    const count = ref(0)

    const onClick = () => {
      count.value++
      console.log(count)
    }

    const props = ref({
      foo: 'foo',
      bar: 'bar',
    })
    const onChangeProps1 = () => {
      props.value.foo = 'new foo'
    }
    const onChangeProps2 = () => {
      props.value.foo = undefined
    }
    const onChangeProps3 = () => {
      props.value = { foo: 'foo' }
    }

    return {
      count,
      props,
      onClick,
      onChangeProps1,
      onChangeProps2,
      onChangeProps3,
    }
  },
  render() {
    return h('div', { id: 'root', ...this.props }, [
      h('div', {}, 'count: ' + this.count),
      h(
        'button',
        {
          onClick: this.onClick,
        },
        'click'
      ),
      h(
        'button',
        {
          onClick: this.onChangeProps1,
        },
        'changeProps 值改变 修改'
      ),
      h(
        'button',
        {
          onClick: this.onChangeProps2,
        },
        'changeProps 值变为  undefined -> 删除'
      ),
      h(
        'button',
        {
          onClick: this.onChangeProps3,
        },
        'changeProps key 没有了 -> 删除'
      ),
    ])
  },
}

export default App
