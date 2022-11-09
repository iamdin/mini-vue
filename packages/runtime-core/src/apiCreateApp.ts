import { createVNode } from './vnode'

export function createAppAPI(
  render: (vnode: any, container: any, parentComponent: any) => void
) {
  return function createApp(rootComponent) {
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
}
