import { createVNodeCall, NodeTypes } from '../ast'

export function transformElement(node, context) {
  return function postTransformElement() {
    if (node.type === NodeTypes.ELEMENT) {
      // 中间处理层
      const vnodeTag = `"${node.tag}"`
      let vnodeProps

      const children = node.children
      let vnodeChildren = children[0]

      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      )
    }
  }
}
