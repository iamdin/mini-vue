import { reactive, readonly } from '../reactive'

describe('readonly', () => {
  it('happy path', () => {
    // readonly cannot set
    const original = reactive({ foo: 1, bar: { baz: 1 } })
    const wrapped = readonly(original)

    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
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
