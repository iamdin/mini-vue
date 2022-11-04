import { NodeTypes } from '../ast'
import { isText } from '../utils'
/**
      node                              node
      /  \          transform           / 
    /     \        ----------->       /
    Text  Text                      Compound_Expression
                                     /          \
                                    Text        Text
 */
export function transformText(node) {
  // 如果当前节点是元素节点
  return function postTransformElement() {
    if (node.type === NodeTypes.ELEMENT) {
      let currentContainer
      const { children } = node
      // 遍历其子节点
      for (let i = 0; i < children.length; ++i) {
        const child = children[i]
        // 当前子节点是文本节点
        if (isText(child)) {
          // 遍历后面的兄弟节点
          for (let j = i + 1; j < children.length; ++j) {
            const next = children[j]
            // 兄弟节点也是文本节点
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],
                }
              }
              // 将当前节点和其兄弟节点放入同一个 compound_expression 节点中
              currentContainer.children.push(` + `)
              currentContainer.children.push(next)
              children.splice(j, 1)
              j--
            } else {
              currentContainer = undefined
              break
            }
          }
        }
      }
    }
  }
}
