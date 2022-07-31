import { createRenderer } from '../runtime-core/renderer'
import { isOn } from '../shared'

function insert(child, parent) {
  parent.insertBefore(child, null)
}

function createElement(tag) {
  return document.createElement(tag)
}

function patchProp(el, key, prevValue, nextValue) {
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, nextValue)
  } else {
    if (nextValue === null || nextValue === undefined) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextValue)
    }
  }
}

/** 将自定义渲染函数作为参数，创建渲染器 */
const renderer: any = createRenderer({
  insert,
  patchProp,
  createElement,
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
