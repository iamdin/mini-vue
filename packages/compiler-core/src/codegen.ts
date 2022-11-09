import { isString } from '@mini-vue/shared'
import { NodeTypes } from './ast'
import {
  CREATE_ELEMENT_VNODE,
  helperNameMap,
  TO_DISPLAY_STRING,
} from './runtimeHelpers'

const aliasHelper = (s: symbol) => `${helperNameMap[s]}: _${helperNameMap[s]}`

function createCodegenContext() {
  const context = {
    code: ``,
    runtimeGlobalName: 'Vue',
    helper(key) {
      return `_${helperNameMap[key]}`
    },
    push(source) {
      context.code += source
    },
    newLine() {
      newLine(0)
    },
  }

  function newLine(n: number) {
    context.push('\n' + ` `.repeat(n))
  }
  return context
}

export function generate(ast) {
  const context = createCodegenContext()
  const { push, newLine } = context

  genFunctionPreamble(ast, context)

  const functionName = 'render'
  const args = ['_ctx', '_cache']

  const signatrue = args.join(', ')

  push(`function ${functionName}(${signatrue}){\n`)

  push(`return `)

  genNode(ast.codegenNode, context)

  newLine()
  push('}')

  return context
}

function genFunctionPreamble(ast, context) {
  const { push, newLine } = context
  const VueBinding = 'Vue'

  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinding}\n`
    )
  }

  newLine()
  push('return ')
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
    default:
      break
  }
}

function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; ++i) {
    if (isString(nodes[i])) {
      push(nodes[i])
    } else {
      genNode(nodes[i], context)
    }

    if (i < nodes.length - 1) {
      push(`, `)
    }
  }
}

/** 生成文本类型 */
function genText(node, context) {
  context.push(JSON.stringify(node.content))
}

/** 生成表达式类型 */
function genExpression(node, context) {
  context.push(node.content)
}

/** 生成插值类型 */
function genInterpolation(node, context) {
  const { push, helper } = context

  // 获取 context 中的 helper, 从中拿到 Vue 实例上的工具方法, 用于展示插值
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(`)`)
}

function genElement(node, context) {
  const { push, helper } = context
  console.log('genElement', node.children)
  const { tag, children, props } = node

  // 获取 context 中的 helper, 从中拿到 Vue 实例上的工具方法, 用于展示插值
  // 这里的工具方法就是 createElementVNode, 用于创建虚拟 DOM
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)

  genNodeList(genNullable([tag, props, children]), context)
  // genNode(children, context)
  push(`)`)
}

/**  */
function genCompoundExpression(node, context) {
  const { push } = context
  const { children } = node
  for (let i = 0; i < children.length; ++i) {
    const child = children[i]
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}

function genNullable(args: any[]) {
  return args.map((arg) => arg || 'null')
}
