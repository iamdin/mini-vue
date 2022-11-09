import { proxyRefs, shallowReadonly } from '@mini-vue/reactivity'
import { EMPTY_OBJ, isFunction, isObject, NOOP } from '@mini-vue/shared'
import { emit } from './componentEmits'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'

export function createComponentInstance(vnode, parent) {
  const type = vnode.type

  const instance: any = {
    type,
    parent,
    vnode,
    next: null,
    proxy: null,
    subTree: null!,

    components: null,

    // emit
    emit: null!,

    // provides, 初始化为 父组件的 provides, 方便区分
    provides: parent ? parent.provides : {},

    //state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,

    // lifecycle hooks
    isMounted: false,
  }

  instance.ctx = { _: instance }
  // 创建 emit 组件事件函数, 通过 emit 绑定 instance，也可使用闭包
  instance.emit = emit.bind(null, instance)
  return instance
}

// 保存组件实例对象，在 setup 调用时可获取
export let currentInstance

export const getCurrentInstance = () => currentInstance
export const setCurrentInstance = (instance) => {
  currentInstance = instance
}
export const unsetCurrentInstance = () => {
  currentInstance = null
}

/** 组件 setup 的执行 */
export function setupComponent(instance) {
  const { props, children } = instance.vnode
  // 初始化组件 Props
  initProps(instance, props)
  // 初始化组件 Slots, 绑定到 instance.slots 中，组件内通过代理 this.$slots 访问
  initSlots(instance, children)
  setupStatefulComponent(instance)
}

/** 执行 setup 获取其中的状态数据 */
function setupStatefulComponent(instance) {
  const Component = instance.type

  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)

  const { setup } = Component
  if (setup) {
    setCurrentInstance(instance)
    // setupResult is function | object
    const setupResult = setup(
      // 将 props 作为参数传递给 setup, props 需要是 shallowReadonly
      shallowReadonly(instance.props),
      /* TODO context */
      {
        emit: instance.emit,
      }
    )
    unsetCurrentInstance()
    handleSetupResult(instance, setupResult)
  }
}

/* 处理 setup 返回值为函数或对象的情况 */
export function handleSetupResult(instance: any, setupResult: unknown) {
  if (isFunction(setupResult)) {
    // TODO render()
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}

/** setup 后执行 compile 函数（如有需要），转换为 render */
function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (!Component.render && compile) {
    if (Component.template) {
      Component.render = compile(Component.template)
    }
  }
  instance.render = Component.render || NOOP
}

let compile

// 抛出注册模块, runtime-core 模块不要直接依赖 compile 模块, 实现解耦
export function registerRuntimeCompiler(_compile) {
  compile = _compile
}
