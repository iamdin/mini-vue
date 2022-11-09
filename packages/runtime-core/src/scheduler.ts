const queue: any[] = []
let isFlushPending = false

const resolvedPromise = Promise.resolve()
let currentFlushPromise: any | null = null

export function nextTick(fn) {
  console.log(currentFlushPromise, resolvedPromise)
  // currentFlushPromise 获取到当前微任务队列执行后的返回值, 保证在所有微任务执行后再执行
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(fn) : p
}

export function queueJob(job) {
  if (!queue.length || !queue.includes(job)) {
    queue.push(job)
  }

  queueFlush()
}

function queueFlush() {
  // 通过 isFlushPending 标识, 避免同步任务中, 重复调用 queueFlush 及 Promise.then
  if (!isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false

  try {
    for (let flushIndex = 0; flushIndex < queue.length; ++flushIndex) {
      const job = queue[flushIndex]
      job && job()
    }
  } finally {
    queue.length = 0
    console.log('finally')

    currentFlushPromise = null
  }
}
