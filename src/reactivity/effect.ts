import { extend } from '../shared'

let activeEffect: ReactiveEffect
let shouldTrack: boolean

class ReactiveEffect {
  private _fn: () => Function
  private _active: boolean = true // 当前对象是否为响应式
  private onStop?: () => void

  public deps: Set<ReactiveEffect>[] = []

  constructor(fn, public scheduler?) {
    this._fn = fn
  }

  run() {
    // 执行 fn 后会开始收集依赖
    if (!this._active) {
      return this._fn()
    }

    shouldTrack = true
    activeEffect = this

    const result = this._fn()

    shouldTrack = false
    return result
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
  effect.deps.length = 0 // 优化
}

/** 判断当前是否正在收集依赖 */
export function isTracking(): boolean {
  return shouldTrack && activeEffect !== void 0
}

const targetMap = new Map()
/** 收集依赖 */
export function track(target, key) {
  if (!isTracking()) return

  // target -> key -> deps
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }

  trackEffect(deps)
}

export function trackEffect(deps) {
  if (deps.has(activeEffect)) return
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

/** 触发依赖 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const deps = depsMap.get(key)

  triggerEffect(deps)
}

export function triggerEffect(deps) {
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
