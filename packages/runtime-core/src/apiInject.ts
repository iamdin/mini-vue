import { isFunction } from '@mini-vue/shared'
import { currentInstance } from './component'

/** 向子组件注入 */
export function provide(key, value) {
  if (!currentInstance) {
    console.warn(`provide() can only be used inside setup()`)
  } else {
    let provides = currentInstance.provides
    const parentProvides =
      currentInstance.parent && currentInstance.parent.provides

    // instance初始时 组件 provides === parentProvides
    if (provides === parentProvides) {
      // 当前组件初始状态，利用原型链的原理，将当前组件的 provides 的原型执行 父组件的 provides
      // provides 通过原型链的机制向上查找
      provides = currentInstance.provides = Object.create(parentProvides)
    }

    provides[key] = value
  }
}

/** 从父组件获取 */
export function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance
  if (instance) {
    // 获取父组件 provides 中的值
    const provides = instance.parent.provides
    // in 支持原型链的访问
    if (provides && key in provides) {
      return provides[key]
    } else {
      // 也可作为函数访问
      return treatDefaultAsFactory && isFunction(defaultValue)
        ? defaultValue.call(instance.proxy)
        : defaultValue
    }
  } else {
    console.warn(
      `inject() can only be used inside setup() or functional components.`
    )
  }
}
