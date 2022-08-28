import { effect, ReactiveEffect } from '../reactivity'
import { EMPTY_ARR, EMPTY_OBJ, ShapeFlags } from '../shared'
import { createAppAPI } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
import { shouldUpdateComponent } from './componentRenderUtils'
import { Text, Fragment, isSameVNodeType } from './vnode'

export function createRenderer(options) {
  return baseCreateRenderer(options)
}

/** 创建渲染器，options 传递自定义渲染函数 */
export function baseCreateRenderer(options) {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options

  const render = (vnode, container, parentComponent) => {
    // patch
    patch(null, vnode, container, null, parentComponent)
  }

  /** 开始处理组件、元素、文本节点等
   * n1 -> oldNode n2 -> newNode
   */
  const patch = (
    n1: any,
    n2: any,
    container: any,
    anchor: any,
    parentComponent
  ) => {
    const { type, shapeFlag } = n2
    switch (type) {
      // Text 节点只渲染文本
      case Text:
        processText(n1, n2, container)
        break
      // Fragment 节点只渲染其子组件
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 Element
          processElement(n1, n2, container, anchor, parentComponent)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 处理 Component
          processComponent(n1, n2, container, anchor, parentComponent)
        }
        break
    }
  }

  const processElement = (
    n1: any,
    n2: any,
    container: any,
    anchor: any,
    parentComponent
  ) => {
    // 初始化时 n1 为 null，挂载节点，否则对比两个元素节点
    if (n1 === null) {
      mountElement(n2, container, anchor, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  /** 挂在元素节点，生成元素节点并插入到 父节点中 */
  const mountElement = (vnode, container, anchor, parentComponent) => {
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
      mountChildren(children, el, anchor, parentComponent)
    }

    hostInsert(el, container, anchor)
  }

  const mountChildren = (children, container, anchor, parentComponent) => {
    for (let i = 0; i < children.length; ++i) {
      const child = children[i]
      patch(null, child, container, anchor, parentComponent)
    }
  }

  const patchElement = (n1: any, n2: any, container: any, parentComponent) => {
    // 对新旧元素节点的的 props 进行对比
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)

    patchChildren(n1, n2, el, null, parentComponent)

    patchProps(el, oldProps, newProps)
  }

  const patchChildren = (n1, n2, container, anchor, parentComponent) => {
    const c1 = n1 && n1.children
    const prevShapeFlag = n1 ? n1.shapeFlag : 0
    const c2 = n2.children

    const { shapeFlag } = n2

    // children has 3 possibilities: text, array or no children.
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 清空旧的子节点
        unmountChildren(c1)
      }
      // 新节点为文本节点
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      // new is Array
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // array diff
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          patchKeyedChildren(c1, c2, container, anchor, parentComponent)
        } else {
          unmountChildren(c2)
        }
      } else {
        // prev children was text OR null
        // new children is array OR null
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, container, anchor, parentComponent)
        }
      }
    }
  }
  const patchKeyedChildren = (
    c1,
    c2,
    container,
    parentAnchor,
    parentComponent
  ) => {
    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1

    // 1. sync from start
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent)
      } else {
        break
      }
      i++
    }
    // 2. sync from end
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent)
      } else {
        break
      }
      e1--
      e2--
    }

    // 3. common sequence + mount
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, anchor, parentComponent)
          i++
        }
      }
    }
    // 4. common sequence + unmount
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    }
    // 5. unknown sequence
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5
    else {
      const s1 = i // prev starting index
      const s2 = i // next starting index

      // 5.1 build key:index map for newChildren
      // 建立新序列的 节点key 与 下标映射表， O(1) 可查旧节点是否存在于新序列
      const keyToNewIndexMap: Map<string | number | symbol, number> = new Map()
      for (i = s2; i <= e2; ++i) {
        const nextChild = c2[i]
        if (nextChild.key !== null) {
          keyToNewIndexMap.set(nextChild.key, i)
        }
      }

      // 5.2 loop through old children left to be patched and try to patch
      // matching nodes & remove nodes that are no longer present
      // 遍历旧序列中的剩余无序节点, 当节点存在与新序列中则 patch, 不存在则 unmount
      let j
      let patched = 0 // 新序列已经 patch 过的节点数量
      const toBePatched = e2 - s2 + 1 // 新序列需要 patch 的节点数量
      let moved = false
      // used to track whether any node has moved
      let maxNewIndexSoFar = 0

      // a[新节点所在的下标] =  旧节点的下标 + 1, 因为这里将数组初始化为特定值 0, 表示新节点不存在旧序列中
      // 用于计算最长递增子序列
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (i = 0; i < toBePatched; ++i) newIndexToOldIndexMap[i] = 0

      for (i = s1; i <= e1; ++i) {
        const prevChild = c1[i]
        // 如果新序列中的节点都已经 patch 过, 旧序列中剩余的都直接 unmount
        if (patched >= toBePatched) {
          unmount(prevChild)
          continue
        }
        let newIndex
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          // key-less node, try to locate a key-less node of the same type
          // 没有 key 的节点。尝试遍历来搜索
          for (j = s2; j <= e2; ++j) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }
        // 旧节点不在新的序列, unmount
        if (newIndex === undefined) {
          unmount(prevChild)
        }
        // 旧节点存在新序列, 递归 patch
        else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          // 当新序列相对于老序列本就是递增的, 不需要求最长递增子序列
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          patch(prevChild, c2[newIndex], container, null, parentComponent)
          patched++
        }
      }

      // 5.3 move and mount
      // generate longest stable subsequence only when nodes have moved
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : EMPTY_ARR // getSequence 返回的是最长递增子序列在数组中的下标组成的数组
      j = increasingNewIndexSequence.length - 1
      for (i = toBePatched - 1; i >= 0; --i) {
        const nextIndex = s2 + i
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor
        if (newIndexToOldIndexMap[i] === 0) {
          // 挂在新节点
          patch(null, nextChild, container, anchor, parentComponent)
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; ++i) {
      const el = children[i].el
      hostRemove(el)
    }
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
    anchor,
    parentComponent
  ) => {
    if (n1 == null) {
      mountComponent(n2, container, anchor, parentComponent)
    } else {
      updateComponent(n1, n2)
    }
  }

  const updateComponent = (n1, n2) => {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  /** 挂在组件，生成组件实例，执行 setup 及 render */
  const mountComponent = (
    initialVNode: any,
    container,
    anchor,
    parentComponent
  ) => {
    // 创建组件实例, 初始化 ctx, emit
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ))
    // initProps, initSlots, 执行组件的 setup 获取 setupState, 初始化 render (如有需要 compile)
    setupComponent(instance)
    // 执行组件的 render
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  const setupRenderEffect = (instance, initialVNode, container, anchor) => {
    // effect 收集render函数中的依赖，当响应式数据变化时，会重新执行 render 函数
    const componentUpdateFn = () => {
      // !isMounted 为初始化阶段，否则为更新
      if (!instance.isMounted) {
        // 调用组件渲染函数，获取当前组件的 vnode, instance.proxy 用来代理 render 函数中的 this，使其访问到当前组件实例如 $, $el 等
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        ))
        // 继续处理组件的子节点
        patch(null, subTree, container, null, instance)
        // 将子元素的 dom 保存到当前节点的 vnode 中
        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        let { vnode, next } = instance
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        } else {
          next = vnode
        }
        const nextTree = instance.render.call(instance.proxy)
        const prevTree = instance.subTree
        instance.subTree = nextTree
        patch(prevTree, nextTree, container, null, instance)
      }
    }
    const effect = new ReactiveEffect(componentUpdateFn)
    const update = (instance.update = () => effect.run())
    update()
  }

  const updateComponentPreRender = (instance, nextVNode) => {
    nextVNode.component = instance
    instance.vnode = nextVNode
    instance.next = null

    instance.props = nextVNode.props
  }

  /** 处理插槽中的 VNode 节点，将数组中的节点直接渲染在上层 Element 容器中 */
  const processFragment = (
    n1: any,
    n2: any,
    container: any,
    anchor,
    parentComponent
  ) => {
    mountChildren(n2.children, container, anchor, parentComponent)
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

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
