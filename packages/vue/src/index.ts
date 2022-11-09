import { baseCompile } from '@mini-vue/compiler-core'
import * as runtimeDom from '@mini-vue/runtime-dom'
import { registerRuntimeCompiler } from '@mini-vue/runtime-dom'

export function compileToFunction(template: string) {
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)

  return render
}

// 给 runtime 注册 compile 方法
registerRuntimeCompiler(compileToFunction)

export * from '@mini-vue/runtime-dom'
export { baseCompile } from '@mini-vue/compiler-core'
