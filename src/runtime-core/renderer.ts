import { isArray, isObject, isOn, ShapeFlags } from '../shared'
import { createComponentInstance, setupComponent } from './component'
import { Text, Fragment } from './vnode'

export function render(vnode, container, parentComponent) {
  // patch
  patch(vnode, container, parentComponent)
}

const patch = (vnode: any, container: any, parentComponent) => {
  const { type, shapeFlag } = vnode

  switch (type) {
    // Text 节点只渲染文本
    case Text:
      processText(vnode, container)
      break
    // Fragment 节点只渲染其子组件
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 Element
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        // 处理 Component
        processComponent(vnode, container, parentComponent)
      }
      break
  }
}

function processElement(vnode: any, container: any, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

function mountElement(vnode, container, parentComponent) {
  let el
  const { type, props, children, shapeFlag } = vnode

  // for type
  el = vnode.el = document.createElement(type)
  // for props
  for (const key in props) {
    const val = props[key]
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }
  // for children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el, parentComponent)
  }

  container.append(el)
}

function mountChildren(children, container, parentComponent) {
  for (let i = 0; i < children.length; ++i) {
    const child = children[i]
    patch(child, container, parentComponent)
  }
}

const processComponent = (vnode: any, container: any, parentComponent) => {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVNode: any, container, parentComponent) {
  // 创建组件实例, 初始化 ctx, emit
  const instance = createComponentInstance(initialVNode, parentComponent)
  // initProps, initSlots, 执行组件的 setup 获取 setupState, 初始化 render (如有需要 compile)
  setupComponent(instance)
  // 执行组件的 render
  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
  // 调用组件渲染函数，获取当前组件的 vnode, instance.proxy 用来代理 render 函数中的 this，使其访问到当前组件实例如 $, $el 等
  const subTree = (instance.subTree = instance.render.call(instance.proxy))
  // 继续处理组件的子节点
  patch(subTree, container, instance)
  // 将子元素的 dom 保存到当前节点的 vnode 中
  initialVNode.el = subTree.el
}

/** 处理插槽中的 VNode 节点，将数组中的节点直接渲染在上层 Element 容器中 */
function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode.children, container, parentComponent)
}

/** 处理文本节点，直接渲染 */
function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = document.createTextNode(children as string)
  container.append(textNode)
}
