import { extend, isObject } from '@mini-vue/shared'
import { track, trigger } from './effect'
import { reactive, readonly, ReactiveFlags } from './reactive'

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

/** proxy get */
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: any, key: string, receiver) {
    /** 判断对象是否为响应式，直接通过代理的方式，当 访问的 key 为 _isReactive 时进行拦截 */
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return shallow
    }

    const res = Reflect.get(target, key, receiver)

    // 应放在前面
    if (!isReadonly) {
      // 收集依赖
      track(target, key)
    }

    // shallow
    if (shallow) {
      return res
    }

    // nested track
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

const set = createSetter()
const shallowSet = createSetter(true)

function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    // 触发依赖的 effect
    trigger(target, key)
    return res
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target: any, key: string | string) {
    console.warn(`key: ${String(key)} set failed, target ${target} is readonly`)
    return true
  },
}

export const shallowReactiveHandlers: ProxyHandler<object> = extend(
  {},
  mutableHandlers,
  {
    get: shallowGet,
    set: shallowSet,
  }
)

export const shallowReadonlyHandlers: ProxyHandler<object> = extend(
  {},
  readonlyHandlers,
  {
    get: shallowReadonlyGet,
  }
)
