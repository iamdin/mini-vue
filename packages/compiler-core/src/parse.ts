import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParseContext(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {
  const nodes: any = []
  while (!isEnd(context, ancestors)) {
    const s = context.source
    console.log('parseChildren', s)
    let node
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      if (/[a-z]/.test(s[1])) {
        node = parseElement(context, ancestors)

        console.log('parse element')
      }
    }

    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }
  return nodes
}

/** 解析插值表达式 */
function parseInterpolation(context) {
  // {{message}}
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  )

  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = parseTextData(context, rawContentLength)
  const content = rawContent.trim()

  advanceBy(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  }
}

/** 解析标签元素 */
function parseElement(context: any, ancestors: any[]) {
  // 1. 解析 tag
  // 2. 删除处理后的代码
  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element)

  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`lack end tag ${element.tag}`)
  }
  console.log('----', context.source)

  return element
}

/** 解析 标签 <div></div> */
function parseTag(context: any, type: TagType) {
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)!
  console.log('parseTag: ', context.source, match)
  const tag = match[1]

  advanceBy(context, match[0].length)
  advanceBy(context, 1)

  if (type === TagType.End) return

  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  }
}

function parseText(context: any): any {
  const endTokens = ['<', '{{']
  let endIndex = context.source.length
  for (let i = 0; i < endTokens.length; ++i) {
    const index = context.source.indexOf(endTokens[i], 1)
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  // 获取 content
  const content = parseTextData(context, endIndex)
  console.log('parseText', content)

  return {
    type: NodeTypes.TEXT,
    content,
  }
}

function parseTextData(context: any, length: number) {
  // 获取 content
  const content = context.source.slice(0, length)
  // 推进
  advanceBy(context, content.length)

  return content
}

function createRoot(children) {
  return { type: NodeTypes.ROOT, children }
}

function createParseContext(content: string) {
  return {
    source: content,
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

/** 结束 parse */
function isEnd(context, ancestors) {
  console.log('isEnd', context)

  // 当遇到结束标签时
  const s = context.source
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; --i) {
      if (startsWithEndTagOpen(s, ancestors[i].tag)) {
        return true
      }
    }
  }
  // if (parentTag && s.startsWith(`</${parentTag}>`)) {
  //   return true
  // }
  // source 有值
  return !s
}

function startsWithEndTagOpen(source: string, tag: string): boolean {
  return (
    source.startsWith('</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  )
}
