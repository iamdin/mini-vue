import { ShapeFlags } from '@mini-vue/shared'

const normalizeSlotValue = (value) => (Array.isArray(value) ? value : [value])

const normalizeObjectSlots = (rawSlots, slots) => {
  for (const key in rawSlots) {
    const value = rawSlots[key]

    // props 为作用域插槽传参
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

/** 组件 slots 初始化 */
export function initSlots(instance, children) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, (instance.slots = {}))
  }
}
