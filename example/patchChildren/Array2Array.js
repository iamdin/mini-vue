import { h, ref } from '../../dist/mini-vue.esm-browser.js'

// 1. 左侧对比
// (a b) c
// (a b) d e
// const prev = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]
// const next = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
// ]

// 2. 右侧对比
// a (b c)
// d e (b c)
// const prev = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]
// const next = [
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]

// 3. 新的比老的长
//
// 3.1
// (a b)
// (a b) c
// i = 2, e1 = 1, e2 = 2
// const prev = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')]
// const next = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]
//
// 3.2
// (a b)
// c (a b)
// i = 0, e1 = -1, e2 = 0
// const prev = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')]
// const next = [
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ]

// 4. 老的比新的长
//
// 4.1
// (a b) c
// (a b)
// i = 2, e1 = 2, e2 = 1
// const prev = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]
// const next = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')]
// 4.2
// a (b c)
// (b c)
// i = 0, e1 = 0, e2 = -1
// const prev = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]
// const next = [h('p', { key: 'B' }, 'B'), h('p', { key: 'C' }, 'C')]

// 5. unknown sequence
// [i ... e1 + 1]: a b [c d e] f g
// [i ... e2 + 1]: a b [e d c h] f g
// i = 2, e1 = 4, e2 = 5
//
// 5.1
// a b [c d] f g
// a b [e c] f g
// 新节点仍存在, patch 新节点, 不存在删除
// const prev = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C', id: 'c-prev' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ]
// const next = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C', id: 'c-next' }, 'C'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ]
// 5.2
// a b [c e d] f g
// a b [e c] f g
// 新节点仍存在, patch 新节点, 不存在删除, 新序列遍历完，旧序列未遍历完的全删除
// const prev = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C', id: 'c-prev' }, 'C'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ]
// const next = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C', id: 'c-next' }, 'C'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ]
// 5.3
// a b [c d e] f g
// a b [e c d] f g
// 节点移动, newIndexToOldIndex = [5 3 4] increasingNewIndexSequence = [1 2]
// const prev = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ]
// const next = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ]
// 5.4
// a b [c d] f g
// a b [e c d] f g
// 节点创建, 不存在创建新的节点
// const prev = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ]
// const next = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ]
// 5.5 综合
// a b [c d e z] f g
// a b [d c y e] f g
const prev = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'Z' }, 'Z'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]
const next = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'Y' }, 'Y'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]
export default {
  name: 'Array2Array',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange

    return { isChange }
  },
  render() {
    return this.isChange ? h('div', {}, next) : h('div', {}, prev)
  },
}
