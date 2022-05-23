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
  el = document.createElement(type)
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
