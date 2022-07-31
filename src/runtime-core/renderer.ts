import { effect } from '../reactivity'
import { EMPTY_OBJ, ShapeFlags } from '../shared'
import { createAppAPI } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
import { Text, Fragment } from './vnode'

export function createRenderer(options) {
  return baseCreateRenderer(options)
}

/** 创建渲染器，options 传递自定义渲染函数 */
export function baseCreateRenderer(options) {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
  } = options

  const render = (vnode, container, parentComponent) => {
    // patch
    patch(null, vnode, container, parentComponent)
  }

  /** 开始处理组件、元素、文本节点等
   * n1 -> oldNode n2 -> newNode
   */
  const patch = (n1: any, n2: any, container: any, parentComponent) => {
    const { type, shapeFlag } = n2

    switch (type) {
      // Text 节点只渲染文本
      case Text:
        processText(n1, n2, container)
        break
      // Fragment 节点只渲染其子组件
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 Element
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 处理 Component
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }

  const processElement = (
    n1: any,
    n2: any,
    container: any,
    parentComponent
  ) => {
    // 初始化时 n1 为 null，挂载节点，否则对比两个元素节点
    if (n1 === null) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  /** 挂在元素节点，生成元素节点并插入到 父节点中 */
  const mountElement = (vnode, container, parentComponent) => {
    let el
    const { type, props, children, shapeFlag } = vnode

    // for type
    el = vnode.el = hostCreateElement(type)

    // for props
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    // for children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    }

    hostInsert(el, container)
  }

  const mountChildren = (children, container, parentComponent) => {
    for (let i = 0; i < children.length; ++i) {
      const child = children[i]
      patch(null, child, container, parentComponent)
    }
  }

  const patchElement = (n1: any, n2: any, parentComponent: any) => {
    // 对新旧元素节点的的 props 进行对比
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps)
  }

  const patchProps = (el, oldProps, newProps) => {
    if (oldProps !== newProps) {
      // 在新节点中修改 或 被赋值为 undefined|null
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }
      // 在新节点中属性值被删除
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  const processComponent = (
    n1: any,
    n2: any,
    container: any,
    parentComponent
  ) => {
    mountComponent(n2, container, parentComponent)
  }

  /** 挂在组件，生成组件实例，执行 setup 及 render */
  const mountComponent = (initialVNode: any, container, parentComponent) => {
    // 创建组件实例, 初始化 ctx, emit
    const instance = createComponentInstance(initialVNode, parentComponent)
    // initProps, initSlots, 执行组件的 setup 获取 setupState, 初始化 render (如有需要 compile)
    setupComponent(instance)
    // 执行组件的 render
    setupRenderEffect(instance, initialVNode, container)
  }

  const setupRenderEffect = (instance, initialVNode, container) => {
    // effect 收集render函数中的依赖，当响应式数据变化时，会重新执行 render 函数
    effect(() => {
      // !isMounted 为初始化阶段，否则为更新
      if (!instance.isMounted) {
        // 调用组件渲染函数，获取当前组件的 vnode, instance.proxy 用来代理 render 函数中的 this，使其访问到当前组件实例如 $, $el 等
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        ))
        // 继续处理组件的子节点
        patch(null, subTree, container, instance)
        // 将子元素的 dom 保存到当前节点的 vnode 中
        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        const nextTree = instance.render.call(instance.proxy)
        const prevTree = instance.subTree
        instance.subTree = nextTree
        console.log('update', prevTree, nextTree)
        patch(prevTree, nextTree, container, instance)
      }
    })
  }

  /** 处理插槽中的 VNode 节点，将数组中的节点直接渲染在上层 Element 容器中 */
  const processFragment = (
    n1: any,
    n2: any,
    container: any,
    parentComponent
  ) => {
    mountChildren(n2.children, container, parentComponent)
  }

  /** 处理文本节点，直接渲染 */
  const processText = (n1: any, n2: any, container: any) => {
    const { children } = n2
    const textNode = document.createTextNode(children as string)
    container.append(textNode)
  }

  return {
    // 创建 createApp() 函数, 通过闭包记录 render
    createApp: createAppAPI(render),
  }
}
