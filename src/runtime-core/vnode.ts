function createBaseVNode(type, props, children) {
  const vnode = { type, props, children }
  return vnode
}

export function createVNode(type, props?, children?) {
  return createBaseVNode(type, props, children)
}
