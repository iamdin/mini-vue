import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

const patch = (vnode: any, container: any) => {
  // 处理 Element
  // 处理 Component
  processComponent(vnode, container)
}

const processComponent = (vnode: any, container: any) => {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render()
  // vnode -> patch
  // vnode -> element -> mount
  patch(subTree, container)
}
