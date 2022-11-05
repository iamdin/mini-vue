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

  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {}

  run() {
    // 执行 fn 后会开始收集依赖
    // 执行 run 后收集依赖，可以通过 shouldTrack 区分是否需要跟踪依赖
    // 当 this.active = false, stop, 不需要跟踪依赖
    if (!this.active) {
      return this.fn()
    }

    try {
      activeEffect = this
      shouldTrack = true

      return this.fn()
    } finally {
      // cleanupEffect(this)

      shouldTrack = false
      activeEffect = undefined
    }
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

export let shouldTrack = true // 解决某些情况下（stop），不需要跟踪依赖的问题

/** 收集依赖 */
export function track(target, key) {
  if (shouldTrack && activeEffect) {
    // target -> key -> deps
    // shouldTrack 处理 stop 后不需要再跟踪依赖的问题
    // 当直接访问 reactive 对象的属性时, activeEffect 为 undefined, 因为 activeEffect 是在 effect.run 中被赋值的
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }

    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }

    trackEffects(deps)
  }
}

export function trackEffects(dep: Dep) {
  let shouldTrack = false
  shouldTrack = !dep.has(activeEffect!)
  if (shouldTrack) {
    dep.add(activeEffect!)
    activeEffect!.deps.push(dep) // 反向收集依赖，让 effect 知道有内部哪些响应式对象
  }
}

/** 触发依赖 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  let deps: (Dep | undefined)[] = []
  if (key !== void 0) {
    deps.push(depsMap.get(key))
  }

  if (deps.length === 1) {
    if (deps[0]) {
      triggerEffects(deps[0])
    }
  }
}

export function triggerEffects(dep: Dep | ReactiveEffect[]) {
  const effects = Array.isArray(dep) ? dep : [...dep]
  for (const effect of effects) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}
