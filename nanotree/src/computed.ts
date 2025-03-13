import { computed, onStop, ReadableAtom } from 'nanostores'
import { NanotreeNode } from './interface.ts'

const Subscribable = {
  subscribe(cb: (v: any) => void) {
    const cleanup = (this as any).listen(cb)
    cb((this as any).get())
    return cleanup
  }
}

const LISTENER = Symbol()
const CLEANUP = Symbol()
const Single = {
  subscribe: Subscribable.subscribe,
  [CLEANUP]() {
    ;(this as any)[LISTENER] = null
  },
  get() {
    return (this as any).value
  },
  listen(cb: (v: any) => void) {
    ;(this as any)[LISTENER] = cb
    return this[CLEANUP].bind(this)
  },
  set(v: any) {
    ;(this as any).value = v
    ;(this as any)[LISTENER]?.(v)
  }
}

export function single<T>(value: T): {
  value: T
  get(): T
  set(value: T): void
  listen(listener: (value: T) => void): () => void
  subscribe(listener: (value: T) => void): () => void
} {
  const s = Object.create(Single)
  s.value = value
  return s
}

const ATOM = Symbol()
const VALUE = Symbol()
const ON = Symbol()
const OFF = Symbol()
const When = {
  subscribe: Subscribable.subscribe,
  get() {
    ;(this as any).value = (this as any)[ATOM].get() === (this as any)[VALUE] ? (this as any)[ON] : (this as any)[OFF]
    return (this as any).value
  },
  listen(cb: (v: any) => void) {
    return (this as any)[ATOM].listen(() => {
      const prev = (this as any).value
      const next = (this as any).get()

      if (prev !== next) {
        cb(next)
      }
    })
  }
}

export function when<E, D, T>(atom: ReadableAtom<T>, value: T, onEqual: E, onDifferent: D): {
  get(): E | D
  listen(listener: (value: E | D) => void): () => void
  subscribe(listener: (value: E | D) => void): () => void
} {
  const w = Object.create(When)
  w[ATOM] = atom
  w[VALUE] = value
  w[ON] = onEqual
  w[OFF] = onDifferent
  w.value = atom.value === value ? onEqual : onDifferent
  return w
}


function $$if<T>($condition: ReadableAtom, $render: T) {
  return computed($condition, (cond) => (cond ? $render : ''))
}

function $$map<T>(
  $list: ReadableAtom<T[]>,
  mapper: (entry: T, index: number, array: T[]) => NanotreeNode | NanotreeNode[],
  keyed: (entry: T, index: number, array: T[]) => NanotreeNode | NanotreeNode[] = (entry) => entry as NanotreeNode,
): ReadableAtom<NanotreeNode | NanotreeNode[]> {
  const map = new Map()
  const getter = (keys: Set<any>) => (entry: T, index: number, array: T[]) => {
    const key = keyed?.(entry, index, array) ?? entry
    keys.delete(key)
    if (!map.has(key)) {
        map.set(key, mapper(entry, index, array))
    }
    return map.get(key)
  }
  const container = computed($list, (list) => {
    const keys = new Set(map.keys())
    const entries = list.map(getter(keys))
    for (const key of keys) {
      map.delete(key)
    }
    return entries
  })

  onStop(container, map.clear.bind(map))

  return container
}

export const $$: {
  with: typeof computed
  if: typeof $$if
  map: typeof $$map
  single: typeof single
  when: typeof when
} = {
  with: computed,
  if: $$if,
  map: $$map,
  single,
  when
}
