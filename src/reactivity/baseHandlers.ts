import { track, trigger } from './effect'
import { ReactiveFlags } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

/** proxy get */
function createGetter(isReadOnly: boolean = false) {
  return function get(target: any, key: string) {
    /** 判断对象是否为响应式，直接通过代理的方式，当 访问的 key 为 _isReactive 时进行拦截 */
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly
    }

    const res = Reflect.get(target, key)

    if (!isReadOnly) {
      // 收集依赖
      track(target, key)
    }
    return res
  }
}

/** proxy set */
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)

    // 触发依赖
    trigger(target, key)

    return res
  }
}

export const mutableHandlers = {
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
