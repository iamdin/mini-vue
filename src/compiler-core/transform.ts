import { isArray } from '../shared'
import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelpers'

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createRootCodegen(root, context)

  root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root, context) {
  const child = root.children[0]

  // 当子节点时 Element 节点时, 直接使用子节点转换后的 codegenNode 节点
  // 因为 Element 节点在 transformText 做了转换
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode
  } else {
    root.codegenNode = root.children[0]
  }
}

function traverseNode(node: any, context) {
  console.log(node)
  const nodeTransforms = context.nodeTransforms
  const exitFn: any[] = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transfrom = nodeTransforms[i]
    const onExit = transfrom(node, context)
    if (onExit) {
      if (isArray(onExit)) {
        exitFn.push(onExit)
      } else {
        exitFn.push(onExit)
      }
    }
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context)
    default:
      break
  }

  let i = exitFn.length
  while (i--) {
    exitFn[i]()
  }
}

function traverseChildren(node: any, context: any) {
  const children = node.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]

      traverseNode(node, context)
    }
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    },
  }
  return context
}
