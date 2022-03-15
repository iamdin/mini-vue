import { isReadonly, reactive, readonly } from '../reactive'

describe('readonly', () => {
  it('happy path', () => {
    // readonly cannot set
    const original = reactive({ foo: 1, bar: { baz: 1 } })
    const wrapped = readonly(original)

    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)

    // isReadonly
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(original)).toBe(false)
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
    // mock
    console.warn = jest.fn()

    const user = readonly({
      age: 10,
    })

    user.age = 11
    expect(console.warn).toBeCalled()
  })
})
