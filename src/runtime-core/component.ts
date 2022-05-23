import { isFunction, isObject, NOOP } from '../shared'

export function createComponentInstance(vnode) {
  const type = vnode.type

  const instance = {
    type,
    vnode,
  }

  return instance
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlots()
  setupStatefulComponent(instance)
}

/* */
function setupStatefulComponent(instance) {
  const Component = instance.type

  const { setup } = Component
  if (setup) {
    // setupResult is function | object
    const setupResult = setup(instance.props /* TODO context */)

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

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (!Component.render) {
    // TODO compile
  }
  instance.render = Component.render || NOOP
}
