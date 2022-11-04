import { generate } from '../codegen'
import { baseParse } from '../parse'
import { transform } from '../transform'
import { transformElement } from '../transforms/transformElement'
import { transformExpression } from '../transforms/transformExpression'
import { transformText } from '../transforms/transformText'

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')

    transform(ast)

    const { code } = generate(ast)

    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')
    transform(ast, {
      nodeTransforms: [transformExpression],
    })

    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('element', () => {
    const ast = baseParse('<div></div>')
    transform(ast, {
      nodeTransforms: [transformElement],
    })

    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('happy path', () => {
    const ast = baseParse('<div>hi, {{message}}</div>')
    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText],
    })
    console.log('transform --->', ast, ast.codegenNode.children)

    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
})
