import {
  isReactive,
  isShallow,
  reactive,
  shallowReactive,
  shallowReadonly,
} from '../src/index'

describe('shallowReactive', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReactive({ n: { foo: 1 } })
    expect(isReactive(props.n)).toBe(false)
  })

  test('should keep reactive properties reactive', () => {
    const props: any = shallowReactive({ n: reactive({ foo: 1 }) })
    props.n = reactive({ foo: 2 })
    expect(isReactive(props.n)).toBe(true)
  })

  // #2843
  test('should allow shallow and normal reactive for same target', () => {
    const original = { foo: {} }
    const shallowProxy = shallowReactive(original)
    const reactiveProxy = reactive(original)
    expect(shallowProxy).not.toBe(reactiveProxy)
    expect(isReactive(shallowProxy.foo)).toBe(false)
    expect(isReactive(reactiveProxy.foo)).toBe(true)
  })

  test('isShallow', () => {
    expect(isShallow(shallowReactive({}))).toBe(true)
    expect(isShallow(shallowReadonly({}))).toBe(true)
  })

  // #5271
  // test('should respect shallow reactive nested inside reactive on reset', () => {
  //   const r = reactive({ foo: shallowReactive({ bar: {} }) })
  //   expect(isShallow(r.foo)).toBe(true)
  //   expect(isReactive(r.foo.bar)).toBe(false)

  //   r.foo = shallowReactive({ bar: {} })
  //   expect(isShallow(r.foo)).toBe(true)
  //   expect(isReactive(r.foo.bar)).toBe(false)
  // })

  // test('should respect shallow/deep versions of same target on access', () => {
  //   const original = {}
  //   const shallow = shallowReactive(original)
  //   const deep = reactive(original)
  //   const r = reactive({ shallow, deep })
  //   expect(r.shallow).toBe(shallow)
  //   expect(r.deep).toBe(deep)
  // })
})
