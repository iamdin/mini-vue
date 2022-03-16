import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _getter: () => any
  private _dirty = true // 标识, 用于惰性计算
  private _value: any
  private _effect: any

  constructor(getter) {
    this._getter = getter
    this._effect = new ReactiveEffect(getter, () => {
      // 使用 ReactiveEffect 的 scheduler 功能
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    // 当 getter 的值发生改变时, dirty 变为 true, 下次在访问计算熟悉, 会重新计算
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }

    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}
