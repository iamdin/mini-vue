import { isObject, isString, ShapeFlags } from '../shared'

function createBaseVNode(
  type,
  props,
  children,
  shapeFlag = ShapeFlags.ELEMENT
) {
  const vnode = { type, props, children, shapeFlag }

  if (children) {
    vnode.shapeFlag |= isString(children)
      ? ShapeFlags.TEXT_CHILDREN
      : ShapeFlags.ARRAY_CHILDREN
  }
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
