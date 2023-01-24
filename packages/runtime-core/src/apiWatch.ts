import { ReactiveEffect } from '@mini-vue/reactivity'
import { queuePreFlushCbs } from './scheduler'

export function watchEffect(cb) {
  const job = () => {
    effect.run()
  }

  let cleanup

  const onCleanup = (fn) => {
    cleanup = effect.onStop = () => {
      fn()
    }
  }

  function getter() {
    if (cleanup) {
      cleanup()
    }
    cb(onCleanup)
  }

  const effect = new ReactiveEffect(getter, () => {
    queuePreFlushCbs(job)
  })

  effect.run()

  return () => effect.stop()
}
