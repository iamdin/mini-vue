import { shallowReadonly } from '../reactivity'
import { isFunction, isObject, NOOP } from '../shared'
import { emit } from './componentEmits'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'

export function createComponentInstance(vnode) {
  const type = vnode.type

  const instance: any = {
    type,
    vnode,
  }

  instance.ctx = { _: instance }
  // 创建 emit 组件事件函数, 通过 emit 绑定 instance，也可使用闭包
  instance.emit = emit.bind(null, instance)
  return instance
}

/** 组件 setup 的执行 */
export function setupComponent(instance) {
  // 初始化组件 Props
  initProps(instance, instance.vnode.props)
  // TODO initSlots()
  setupStatefulComponent(instance)
}

/** 执行 setup 获取其中的状态数据 */
function setupStatefulComponent(instance) {
  const Component = instance.type

  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)

  const { setup } = Component
  if (setup) {
    // setupResult is function | object
    const setupResult = setup(
      // 将 props 作为参数传递给 setup, props 需要是 shallowReadonly
      shallowReadonly(instance.props),
      /* TODO context */
      {
        emit: instance.emit,
      }
    )

    handleSetupResult(instance, setupResult)
  }
}

/* 处理 setup 返回值为函数或对象的情况 */
export function handleSetupResult(instance: any, setupResult: unknown) {
  if (isFunction(setupResult)) {
    // TODO render()
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

/** setup 后执行 compile 函数（如有需要），转换为 render */
function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (!Component.render) {
    // TODO compile
  }
  instance.render = Component.render || NOOP
}
