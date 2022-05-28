import { isArray, isFunction, isObject, isString, ShapeFlags } from '../shared'

export const Fragment = Symbol('Fragment')

function createBaseVNode(
  type,
  props,
  children,
  shapeFlag = ShapeFlags.ELEMENT
) {
  const vnode = { type, props, children, shapeFlag }

  let flag = 0
  if (!children) {
    children = null
  } else if (isArray(children)) {
    flag = ShapeFlags.ARRAY_CHILDREN
  } else if (isObject(children)) {
    flag = ShapeFlags.SLOTS_CHILDREN
  } else {
    flag = ShapeFlags.TEXT_CHILDREN
  }

  vnode.shapeFlag |= flag
  return vnode
}

export function createVNode(type, props?, children?) {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0
  return createBaseVNode(type, props, children, shapeFlag)
}
