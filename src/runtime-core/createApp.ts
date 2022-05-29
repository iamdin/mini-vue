import { render } from './renderer'
import { createVNode } from './vnode'

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 先创建 vNode
      // component -> vNode
      const vnode = createVNode(rootComponent)

      // 所有的逻辑操作 都基于 vNode 处理
      render(vnode, rootContainer, null)
    },
  }
}
