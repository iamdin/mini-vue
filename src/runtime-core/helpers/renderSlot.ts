import { createVNode } from '../vnode'

/** 将 slot 转换为 vnode 节点 */
export function renderSlot(slots, name: string, props = {}) {
  let slot = slots[name]

  if (slot) {
    return createVNode('div', {}, slot(props))
  }
}
