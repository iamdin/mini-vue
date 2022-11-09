import { isReactive, isReadonly, readonly, shallowReadonly } from '../src/index'

describe('reactivity/shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReactive(props.n)).toBe(false)
  })

  test('should make root level properties readonly', () => {
    const props = shallowReadonly({ n: 1 })
    console.warn = vi.fn()
    // @ts-ignore
    props.n = 2
    expect(props.n).toBe(1)
    expect(console.warn).toBeCalled()
  })

  // to retain 2.x behavior.
  test('should NOT make nested properties readonly', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    console.warn = vi.fn()
    // @ts-ignore
    props.n.foo = 2
    expect(props.n.foo).toBe(2)
    expect(console.warn).not.toBeCalled()
  })

  // #2843
  test('should differentiate from normal readonly calls', () => {
    const original = { foo: {} }
    const shallowProxy = shallowReadonly(original)
    const reactiveProxy = readonly(original)
    expect(shallowProxy).not.toBe(reactiveProxy)
    expect(isReadonly(shallowProxy.foo)).toBe(false)
    expect(isReadonly(reactiveProxy.foo)).toBe(true)
  })
})
