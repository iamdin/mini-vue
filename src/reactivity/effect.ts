import { extend } from '../shared'

export type EffectScheduler = (...args: any[]) => any
export type Dep = Set<ReactiveEffect>

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {

  private active = true // 当前对象是否为响应式
  private onStop?: () => void

  public deps: Set<ReactiveEffect>[] = []
  // scheduler 存在, 当触发依赖更新时, 会执行 scheduler, 而不是 effect._fn
// The main Map that stores {target -> key -> dep} connections.


  constructor(public fn: () => T, public scheduler: EffectScheduler | null = null) {}

  run() {
    // 执行 fn 后会开始收集依赖
    if (!this.active) {
      return this.fn()
    }

    shouldTrack = true
    activeEffect = this

    const result = this.fn()

    shouldTrack = false
    return result
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  for (const dep of effect.deps) {
    if (dep.has(effect)) {
      dep.delete(effect)
    }
  }
  effect.deps.length = 0
}

export interface ReactiveEffectOptions {
  scheduler?: EffectScheduler
  onStop?: () => void
}
export interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
}

export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const _effect = new ReactiveEffect(fn, options?.scheduler)
  extend(_effect, options)

  _effect.run()

  // bind the effect 解决 run() 中的 this 指向问题
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect // 记录 effect

  return runner
}


/** 停止触发依赖更新 */
export function stop(runner: ReactiveEffectRunner) {
  runner.effect.stop()
}

export let shouldTrack = true

/** 收集依赖 */
export function track(target, key) {
  if (shouldTrack && activeEffect) {
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
}

export function trackEffect(deps) {
  let shouldTrack = false
  shouldTrack = !deps.has(activeEffect)
  if (shouldTrack) {
    deps.add(activeEffect)
    activeEffect!.deps.push(deps)
  }
}

/** 触发依赖 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const deps = depsMap.get(key)

  triggerEffects(deps)
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}


