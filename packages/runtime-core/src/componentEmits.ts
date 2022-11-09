import { camelize, toHandlerKey } from '@mini-vue/shared'

export function emit(instance, event: string, ...args) {
  console.log(`emit ${event}`)

  // 组件事件也保存在 props 中
  const props = instance.props

  let handlerName
  // 解析事件名，emit('bar') -> onBar, emit('bar-foo') -> onBarFoo
  let handler =
    props[(handlerName = toHandlerKey(event))] ||
    props[(handlerName = toHandlerKey(camelize(event)))]

  if (handler) {
    handler(...args)
  }
}
