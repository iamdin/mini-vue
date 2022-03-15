import { track, trigger } from './effect'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

/** proxy get */
function createGetter(isReadOnly: boolean = false) {
  return function get(target: any, key: string) {
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
