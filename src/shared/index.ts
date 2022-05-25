export * from './shapeFlags'

const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)

export const extend = Object.assign

export const isArray = Array.isArray
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)
export const NOOP = () => {}
