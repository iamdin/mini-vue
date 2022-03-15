import { mutableHandlers, readonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadOnly',
}

/** 响应式代理对象 */
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

/** 只读代理对象 */
export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

export function isReactive(value): boolean {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value): boolean {
  return !!value[ReactiveFlags.IS_READONLY]
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}
