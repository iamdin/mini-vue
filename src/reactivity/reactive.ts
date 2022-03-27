import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadOnly',
}

/** 响应式代理对象 */
export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

/** 只读代理对象 */
export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}

/** 浅只读代理对象 */
export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value): boolean {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value): boolean {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value): boolean {
  return isReactive(value) || isReadonly(value)
}

function createReactiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}
