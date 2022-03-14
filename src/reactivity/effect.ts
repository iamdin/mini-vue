
import { extend } from "../shared"

class ReactiveEffect {
  private _fn: () => Function
  private _active: boolean = true // 当前对象是否为响应式
  private onStop?: () => void

  public deps: Set<ReactiveEffect>[] = []

  constructor(fn, public scheduler?) {
    this._fn = fn
  }

  run() {
    activeEffect = this
    return this._fn()
  }

  /** 停止触发依赖 */
  stop() {
    if (this._active) {
      cleanupEffect(this)
      this.onStop && this.onStop()
      this._active = false
    }
  }
}

export function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach((dep) => dep.delete(effect))
}

const targetMap = new Map()
/** 收集依赖 */
export function track(target, key) {
  // target -> key -> deps
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }

  if (!activeEffect) return
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

/** 触发依赖 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const deps = depsMap.get(key)

  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

/** 停止触发依赖更新 */
export function stop(runner) {
  runner._effect.stop()
}

let activeEffect: ReactiveEffect
export function effect(fn, options: any = {}): () => any {
  const { scheduler } = options
  const _effect = new ReactiveEffect(fn, scheduler)
  extend(_effect, options)

  _effect.run()

  // bind the effect 解决 run() 中的 this 指向问题
  const runner: any = _effect.run.bind(_effect)
  runner._effect = _effect // 记录 effect

  return runner
}
