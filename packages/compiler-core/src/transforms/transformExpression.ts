import { NodeTypes } from '../ast'

export const transformExpression = (node, context) => {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content, context)
  }
}

function processExpression(node: any, context: any): any {
  const rawExp = node.content
  node.content = `_ctx.${rawExp}`
  return node
}
