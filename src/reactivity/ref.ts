import { hasChanged } from '../shared'
import { toReactive } from './reactive'
import { activeEffect, Dep, shouldTrack, trackEffects, triggerEffects } from './effect'


export interface Ref<T = any> {
  value: T
}

export function trackRefValue(ref) {
  if (shouldTrack && activeEffect) {
    trackEffects(ref.dep)
  }
}

export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}

export function unref<T>(ref: T | Ref<T>): T {
  return isRef(ref) ? (ref.value as any) : ref
}

export function ref(value?: unknown): any {
  return createRef(value)
}

function createRef(rawValue: unknown) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue)
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T
  dep: Dep = new Set()

  public readonly __v_isRef = true

  constructor(value) {
    this._rawValue = value
    this._value = toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = toReactive(newValue)
      triggerEffects(this.dep)
    }
  }
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unref(Reflect.get(target, key))
    },

    set(target, key, value) {
      // key is ref, value not ref, operate the value
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    },
  })
}

