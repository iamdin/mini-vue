import { isObject } from '../shared'
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
}

/** 响应式代理对象 */
export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

/** 只读代理对象 */
export function shallowReactive(raw) {
  return createReactiveObject(raw, shallowReactiveHandlers)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}

/** 浅只读代理对象 */
export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers)
}

function createReactiveObject(target: Target, baseHandlers: ProxyHandler<any>) {
  return new Proxy(target, baseHandlers)
}

export function isReactive(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}

export function isShallow(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_SHALLOW])
}

export function isProxy(value: unknown): boolean {
  return isReactive(value) || isReadonly(value)
}

export const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value) : value
