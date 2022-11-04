import { NodeTypes } from '../ast'
import { baseParse } from '../parse'
import { transform } from '../transform'

describe('transform', () => {
  it('happy path', () => {
    const ast = baseParse('<div>hi,{{message}}</div>')

    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content += 'mini-vue'
      }
    }
    transform(ast, {
      nodeTransforms: [plugin],
    })

    const nodeText = ast.children[0].children[0]
    expect(nodeText.content).toBe('hi,mini-vue')
  })
})
