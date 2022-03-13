import { reactive } from '../reactive'
import { effect } from '../effect'
describe('reactivity', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    // update
    user.age++
    expect(nextAge).toBe(12)
  })

  it('runner', () => {
    let foo = 10

    // 执行 effect 后返回 runner 函数
    // 执行 runner 函数后会在次执行 effect 中的 fn, 并 fn 的函数值
    const runner = effect(() => {
      foo++
      return 'bar'
    })

    expect(foo).toBe(11)
    const res = runner()

    expect(foo).toBe(12)
    expect(res).toBe('bar')
  })

  it('scheduler', () => {
    // 1. effect 的第二个参数给定 一个 scheduler 函数
    // 2. effect 第一次执行的时候执行 fn
    // 3. 当响应式对象 update 时不会再执行 fn, 而是执行 schedule
    // 4. 当再次执行 runner 函数时, 会再次执行 fn

    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })

    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1)

    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)

    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })
})
