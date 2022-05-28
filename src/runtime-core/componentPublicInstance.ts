import { extend, hasOwn } from '../shared'
export type PublicPropertiesMap = Record<string, (i: any) => any>

export const publicPropertiesMap: PublicPropertiesMap = extend(
  Object.create(null),
  {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
  }
)

/** proxy handlers 代理 vue 中的全局 API */
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    if (key[0] !== '$') {
      if (hasOwn(setupState, key)) {
        return setupState[key]
      } else if (hasOwn(props, key)) {
        return props[key]
      }
    }

    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  },
}
