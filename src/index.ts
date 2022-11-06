import { baseCompile } from './compiler-core'
import * as runtimeDom from './runtime-dom'
import { registerRuntimeCompiler } from './runtime-dom'

export function compileToFunction(template: string) {
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)

  return render
}

// 给 runtime 注册 compile 方法
registerRuntimeCompiler(compileToFunction)

export * from './runtime-dom'
export { baseCompile } from './compiler-core'
