import { hasChanged, isObject } from '../shared'
import { isTracking, trackEffect, triggerEffect } from './effect'
import { reactive } from './reactive'

/** 通过包装对象 RefImpl 的 get set value 方法，实现对原始值的包装 */
class RefImpl {
  private _value: any
  private _rawValue: any

  public deps?: Set<any>
  public readonly __v_isRef = true

  constructor(value) {
    // if ref value is object, should wrapped with reactive
    this._rawValue = value
    this._value = isObject(value) ? reactive(value) : value
    this.deps = new Set()
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = isObject(newValue) ? reactive(newValue) : newValue
      triggerEffect(this.deps)
    }
  }
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffect(ref.deps)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref) {
  return !!(ref && ref.__v_isRef)
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
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
