import { createRenderer } from '@mini-vue/runtime-core'
import { isOn } from '@mini-vue/shared'

function insert(child, parent, anchor) {
  parent.insertBefore(child, anchor || null)
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

function remove(child) {
  const parent = child && child.parentNode
  if (parent) {
    parent.removeChild(child)
  }
}

function setElementText(el, text) {
  el.textContent = text
}

/** 将自定义渲染函数作为参数，创建渲染器 */
const renderer: any = createRenderer({
  insert,
  remove,
  patchProp,
  createElement,
  setElementText,
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '@mini-vue/runtime-core'
