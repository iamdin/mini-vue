import { reactive } from '../reactive'
import { effect, stop } from '../effect'

describe('effect', () => {
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
    // 传入参数存在 scheduler 时, 响应式对象更新不再执行 effect.fn, 而是 scheduler
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
    expect(scheduler).not.toHaveBeenCalled()
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

  it('stop', () => {
    // 停止响应式触发
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    // obj.prop = 3
    // obj.prop++ => obj.prop = obj.prop + 1 => get + set, 会重新触发依赖收集，导致 stop 失败
    obj.prop++
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })

  it('onStop', () => {
    // onStop 回调函数
    const obj = reactive({
      foo: 1,
    })
    const onStop = jest.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { onStop }
    )

    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })

  it('runner, should discover new branches when running manually', () => {
    let dummy
    let run = false
    const obj = reactive({ prop: 'value' })
    const runner = effect(() => {
      return (dummy = run ? obj.prop : 'other')
    })

    expect(dummy).toBe('other') // run = false, effect 执行时 dummy = 'other'
    runner() // 手动调用 runner, 执行 effect.fn
    expect(dummy).toBe('other') // run 不变, dummy 也不变
    expect(runner()).toBe('other') // runner return
    run = true // --------------------------------------------------
    runner() // 手动调用 runner, 执行 effect.fn
    expect(dummy).toBe('value') // run = true, dummy = 'value'
    expect(runner()).toBe('value') // runner return

    obj.prop = 'World' // 响应式仍然有效
    expect(dummy).toBe('World')
  })
})
