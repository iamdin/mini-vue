import { reactive, isReactive, isProxy } from '../index'

describe('reactive', () => {
  it('happy path', () => {
    const original = { foo: 1 }
    const observed = reactive(original)

    expect(original).not.toBe(observed)
    expect(original.foo).toBe(1)

    // isReadonly
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)

    // isProxy
    expect(isProxy(observed)).toBe(true)
  })

  it('nested reactive', () => {
    const original = {
      nested: { foo: 1 },
      array: [{ bar: 2 }],
    }
    const observed = reactive(original)

    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
  
  test('nested reactives', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
})
