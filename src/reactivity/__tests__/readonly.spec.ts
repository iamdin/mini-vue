import { effect, isProxy, isReactive, isReadonly, readonly } from '../index'

describe('readonly', () => {
  it('happy path', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)

    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)

    // isReadonly
    expect(isProxy(wrapped)).toBe(true)
    expect(isReadonly(original)).toBe(false)
    expect(isReadonly(wrapped)).toBe(true)

    // isProxy
    expect(isProxy(wrapped)).toBe(true)
  })

  it('should make nested readonly', () => {
    const original = {
      nested: { foo: 1 },
      array: [{ bar: 2 }],
    }
    const wrapped = readonly(original)

    expect(isReadonly(wrapped.nested)).toBe(true)
    expect(isReadonly(wrapped.array)).toBe(true)
    expect(isReadonly(wrapped.array[0])).toBe(true)
  })

  it('warn when call set', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)

    console.warn = jest.fn()

    wrapped.foo = 2
    expect(console.warn).toBeCalled()
  })

  describe('Object', () => {
    it('should make nested values readonly', () => {
      const original = { foo: 1, bar: { baz: 2 } }
      const wrapped = readonly(original)
      expect(wrapped).not.toBe(original)
      expect(isProxy(wrapped)).toBe(true)
      expect(isReactive(wrapped)).toBe(false)
      expect(isReadonly(wrapped)).toBe(true)
      expect(isReactive(original)).toBe(false)
      expect(isReadonly(original)).toBe(false)
      expect(isReactive(wrapped.bar)).toBe(false)
      expect(isReadonly(wrapped.bar)).toBe(true)
      expect(isReactive(original.bar)).toBe(false)
      expect(isReadonly(original.bar)).toBe(false)
      // get
      expect(wrapped.foo).toBe(1)
      // has
      expect('foo' in wrapped).toBe(true)
      // ownKeys
      expect(Object.keys(wrapped)).toEqual(['foo', 'bar'])
    })

    it('should not allow mutation', () => {
      const qux = Symbol('qux')
      const original = {
        foo: 1,
        bar: {
          baz: 2,
        },
        [qux]: 3,
      }
      const wrapped = readonly(original)
      console.warn = jest.fn()

      wrapped.foo = 2
      expect(wrapped.foo).toBe(1)
      expect(console.warn).toBeCalledTimes(1)

      wrapped.bar.baz = 3
      expect(wrapped.bar.baz).toBe(2)
      expect(console.warn).toBeCalledTimes(2)

      wrapped[qux] = 4
      expect(wrapped[qux]).toBe(3)
      expect(console.warn).toBeCalledTimes(3)

      // @ts-ignore
      // delete wrapped.foo
      // expect(wrapped.foo).toBe(1)
      // expect(console.warn).toBeCalled()

      // // @ts-ignore
      // delete wrapped.bar.baz
      // expect(wrapped.bar.baz).toBe(2)
      // expect(console.warn).toBeCalled()

      // // @ts-ignore
      // delete wrapped[qux]
      // expect(wrapped[qux]).toBe(3)
      // expect(console.warn).toBeCalled()
    })

    it('should not trigger effects', () => {
      const wrapped: any = readonly({ a: 1 })
      let dummy
      console.warn = jest.fn()
      effect(() => {
        dummy = wrapped.a
      })
      expect(dummy).toBe(1)
      wrapped.a = 2
      expect(wrapped.a).toBe(1)
      expect(dummy).toBe(1)
      expect(console.warn).toBeCalled()
    })
  })
})
