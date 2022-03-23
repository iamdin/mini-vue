import { isReadonly, shallowReadonly } from '../reactive'

describe('shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ nested: { foo: 1 } })

    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.nested)).toBe(false)
  })


  it('warn when call set', () => {
    // mock
    console.warn = jest.fn()

    const user = shallowReadonly({
      age: 10,
    })

    user.age = 11
    expect(console.warn).toBeCalled()
  })
})
