import { computed } from '../computed'
import { reactive } from '../reactive'

describe('computed', () => {
  it('happy path', () => {
    // .value & cache
    const user = reactive({ age: 1 })

    const age = computed(() => user.age)

    expect(age.value).toBe(1)
  })

  it('computed should be lazily', () => {
    const value = reactive({ foo: 1 })
    const getter = jest.fn(() => value.foo)
    const computedValue = computed(getter)

    // lazy, init will not call getter, called getter after access value 
    expect(getter).not.toHaveBeenCalled()

    expect(computedValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // access value should not compute again
    computedValue.value
    expect(getter).toHaveBeenCalledTimes(1) 

    // should not computed until needed
    value.foo = 2 // reactive will call trigger after set
    expect(getter).toHaveBeenCalledTimes(1)

    // after access computed value, not it should compute
    expect(computedValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
