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
})
