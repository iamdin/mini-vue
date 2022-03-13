class ReactiveEffect {
  private _fn

  constructor(fn) {
    this._fn = fn
  }

  run() {
    activeEffect = this
    return this._fn()
  }
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

  deps.add(activeEffect)
}

/** 触发依赖 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const deps = depsMap.get(key)

  for (const effect of deps) {
    effect.run()
  }
}

let activeEffect: any
export function effect(fn): () => any {
  const _effect = new ReactiveEffect(fn)

  _effect.run()

  // bind the effect 解决 run() 中的 this 指向问题
  return _effect.run.bind(_effect)
}
