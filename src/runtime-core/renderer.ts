import { isArray, isObject } from '../shared'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

const patch = (vnode: any, container: any) => {
  if (typeof vnode.type === 'string') {
    // 处理 Element
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    // 处理 Component
    processComponent(vnode, container)
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  let el
  const { type, props, children } = vnode

  // for type
  el = vnode.el = document.createElement(type)
  // for props
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }
  // for children
  if (typeof children === 'string') {
    el.textContent = children
  } else if (isArray(children)) {
    mountChildren(children, el)
  }

  container.append(el)
}

function mountChildren(children, container) {
  for (let i = 0; i < children.length; ++i) {
    const child = children[i]
    patch(child, container)
  }
}

const processComponent = (vnode: any, container: any) => {
  mountComponent(vnode, container)
}

function mountComponent(initialVNode: any, container) {
  // 创建组件实例
  const instance = createComponentInstance(initialVNode)
  // 执行组件的 setup
  setupComponent(instance)
  // 执行组件的 render
  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
  // 调用组件渲染函数，获取当前组件的 vnode, instance.proxy 用来代理 render 函数中的 this，使其访问到当前组件实例如 $, $el 等
  const subTree = (instance.subTree = instance.render.call(instance.proxy))
  // 继续处理组件的子节点
  patch(subTree, container)
  // 将子元素的 dom 保存到当前节点的 vnode 中
  initialVNode.el = subTree.el
}
