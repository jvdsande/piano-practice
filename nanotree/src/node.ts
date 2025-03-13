import { setup as Setup } from './setup.ts'
import {
  ElementEvents,
  ElementProperties,
  ElementStaticProperties,
  EventHandler,
  NanotreeNode,
  Primitive
} from './interface.ts'
import { ReadableAtom } from 'nanostores'

export { $$ } from './computed.ts'
export * from './interface.ts'

const ATOM = Symbol()
const STOP = Symbol()
const SETUP = Symbol()
const TEARDOWN = Symbol()
const SUB = Symbol()
const UNSUB = Symbol()
const CLEAN = Symbol()
const LISTENERS = Symbol()
const PROPERTY = Symbol()
const PROPERTIES = Symbol()
const CHILDREN = Symbol()
const EVENTS = Symbol()
const NODES = Symbol()
const ONLY_CHILD = Symbol()
const COMPONENT = Symbol()

export interface CandidateElement extends HTMLElement {
  [TEARDOWN]?: () => void
  [SETUP]?: () => void
}

function staticNode(node: NanotreeNode, onlyChild: boolean = false) {
  if (typeof node !== 'object') {
    return document.createTextNode(`${node}`)
  }

  if (node && 'subscribe' in node) {
    const stop = (node as any)[STOP] || new Wrap(node)
    stop[ONLY_CHILD] = onlyChild
    return stop
  }

  return node
}

const cleaner = document.createDocumentFragment()

type NanotreeNodeList = NanotreeNode | readonly NanotreeNode[]

class Wrap extends Comment {
  [ATOM]: ReadableAtom<NanotreeNodeList>
  [CHILDREN]: CandidateElement[]
  [SUB]: typeof Wrap[typeof SUB]
  [UNSUB]?: () => void
  [SETUP]?: typeof Wrap[typeof SETUP]
  [TEARDOWN]?: typeof Wrap[typeof TEARDOWN]
  [ONLY_CHILD]?: boolean

  constructor(atom: ReadableAtom<NanotreeNodeList>) {
    super()
    this[ATOM] = atom
    this[CHILDREN] = []
    this[SUB] = Wrap[SUB].bind(this)
    this[SETUP] = Wrap[SETUP]
    ;(atom as any)[STOP] = this
  }

  [CLEAN](next: HTMLElement[]) {
    const toRemove = !next.length
      ? this[CHILDREN].slice(0)
      : this[CHILDREN].filter((n) => !next.includes(n))
    cleaner.replaceChildren(...toRemove)
    setTimeout(() => {
      for (const n of toRemove) n?.[TEARDOWN]?.()
    })
    return toRemove.length
  }

  static [SUB](this: Wrap, node: NanotreeNodeList) {
    if (this[CHILDREN].length === 1 && this[CHILDREN][0] instanceof Text && typeof node !== 'object') {
      this[CHILDREN][0].textContent = node as string
      return
    }

    const _nodes = [node].flat(Infinity) as NanotreeNode[]
    const nodes = new Array(_nodes.length)
    for (const n in _nodes) nodes[n] = staticNode(_nodes[n], _nodes.length === 1)

    if (COMPONENT in this[ATOM]) {
      this.before(...nodes)
      this.remove()
      for (const n of nodes) n?.[SETUP]?.()
      this[CHILDREN] = nodes
      return
    }

    if (this[ONLY_CHILD] && !nodes.length) {
      this.parentNode?.replaceChildren(this)
      const n = this[CHILDREN].slice(0)
      setTimeout(() => {
        for (const c of n) c?.[TEARDOWN]?.()
      })
      this[CHILDREN].length = 0
      return
    }

    EXIT: do {
      if (this[ONLY_CHILD] && !this[CHILDREN].length) {
        this.parentNode?.append(...nodes, this)
        break EXIT
      }

      const removed = this[CLEAN](nodes)

      if (this[ONLY_CHILD] && removed === this[CHILDREN].length) {
        this.parentNode?.replaceChildren(...nodes, this)
        break EXIT
      }

      const offset = Array.prototype.indexOf.call(this.parentNode!.childNodes, this) + removed - this[CHILDREN].length
      let curNode = this.parentNode?.childNodes.item(offset) ?? null

      // Go through the new node list
      for (let i = 0; i < nodes.length; i += 1) {
        if (curNode === nodes[i]) {
          curNode = curNode!.nextSibling
          continue
        }

        if (curNode && curNode !== this) {
          if (nodes[i].parentNode === this.parentNode) {
            const next = curNode.nextSibling
            curNode.replaceWith(nodes[i])
            curNode = next
          } else {
            curNode.before(nodes[i])
            curNode = curNode.nextSibling
          }

          continue
        }

        this.before(...nodes.slice(i))
        break EXIT
      }
    } while (0)

    this[CHILDREN] = nodes
    for (const n of nodes) n?.[SETUP]?.()
  }

  static [TEARDOWN](this: Wrap) {
    delete this[TEARDOWN]

    this[UNSUB]?.()
    const n = this[CHILDREN].slice(0)
    setTimeout(() => {
      for (const c of n) c?.[TEARDOWN]?.()
    })
    this[CHILDREN].length = 0

    this[SETUP] = Wrap[SETUP]
  }

  static [SETUP](this: Wrap) {
    delete this[SETUP]
    this[UNSUB] = this[ATOM].subscribe(this[SUB])
    this[TEARDOWN] = Wrap[TEARDOWN]
  }
}

export interface NanotreeListElement extends HTMLElement {
  [ATOM]: ReadableAtom<CandidateElement[]>
  [CLEAN]: (this: NanotreeListElement, next: readonly CandidateElement[]) => number
  [TEARDOWN]?: () => void
  [SETUP]?: () => void
  [SUB]?: (this: NanotreeListElement, nodes: readonly  CandidateElement[]) => void
  [UNSUB]?: () => void
  [CHILDREN]: CandidateElement[]
  childNodes: NodeListOf<CandidateElement>
}

const NanotreeList = {
  [CLEAN](this: NanotreeListElement, next: readonly CandidateElement[]) {
    const toRemove = !next.length
      ? [...this.childNodes]
      : [...this.childNodes].filter((n) => !next.includes(n))
    cleaner.replaceChildren(...toRemove)
    setTimeout(() => {
      for (const n of toRemove) n?.[TEARDOWN]?.()
    })
    return toRemove.length
  },
  [SUB](this: NanotreeListElement, nodes: readonly CandidateElement[]) {
    if (!nodes.length) {
      const n = [...this.childNodes]
      setTimeout(() => {
        for (const c of n) c?.[TEARDOWN]?.()
      })
      this.innerText = ''
      return
    }

    EXIT: do {
      if (!this.childNodes.length) {
        this.append(...nodes)
        break EXIT
      }

      const removed = this[CLEAN](nodes)

      if (removed === this.childNodes.length) {
        this.replaceChildren(...nodes)
        break EXIT
      }

      let curNode = this.childNodes.item(0)

      // Go through the new node list
      for (let i = 0; i < nodes.length; i += 1) {
        if (curNode === nodes[i]) {
          curNode = curNode.nextSibling as CandidateElement
          continue
        }

        if (curNode) {
          if (nodes[i].parentNode === this) {
            const next = curNode.nextSibling
            curNode.replaceWith(nodes[i])
            curNode = next as CandidateElement
          } else {
            curNode.before(nodes[i])
            curNode = curNode.nextSibling as CandidateElement
          }

          continue
        }

        this.append(...nodes.slice(i))
        break EXIT
      }
    } while (0)

    for (const n of nodes) n?.[SETUP]?.()
  },
  [TEARDOWN](this: NanotreeListElement) {
    delete this[TEARDOWN]

    this[UNSUB]?.()
    const n = [...this.childNodes]
    setTimeout(() => {
      for (const c of n) c?.[TEARDOWN]?.()
    })
    this[CHILDREN].length = 0

    this[SETUP] = NanotreeList[SETUP]
  },
  [SETUP](this: NanotreeListElement) {
    delete this[SETUP]
    this[UNSUB] = this[ATOM].subscribe(this[SUB]!)
    this[TEARDOWN] = NanotreeList[TEARDOWN]
  }
}

export function list(target: string, atom: ReadableAtom<CandidateElement[]>) {
  const element = document.createElement(target) as NanotreeListElement
  element[ATOM] = atom
  element[CLEAN] = NanotreeList[CLEAN]
  element[SUB] = NanotreeList[SUB].bind(element)
  element[SETUP] = NanotreeList[SETUP]
  return element
}

export type NanotreeListenerElement<T extends HTMLElement> = T & {
  [SETUP]?: () => void
  [TEARDOWN]?: () => void

  bind(this: NanotreeListenerElement<T>, properties: ElementProperties<T>): NanotreeListenerElement<T>
  mount(this: NanotreeListenerElement<T>, nodes: NanotreeNode | NanotreeNode[]): NanotreeListenerElement<T>
  on(this: NanotreeListenerElement<T>, events: ElementEvents<any>): NanotreeListenerElement<T>
  on(this: NanotreeListenerElement<T>, event: string, listener: EventHandler<any, any>): NanotreeListenerElement<T>
}
export type NanotreeStaticElement<T extends HTMLElement> = T & {
  bind(this: NanotreeListenerElement<T>, properties: ElementStaticProperties<T>): NanotreeListenerElement<T>
  mount(this: NanotreeListenerElement<T>, nodes: NanotreeNode | NanotreeNode[]): NanotreeListenerElement<T>
  on(this: NanotreeListenerElement<T>, events: ElementEvents<any>): NanotreeListenerElement<T>
  on(this: NanotreeListenerElement<T>, event: string, listener: EventHandler<any, any>): NanotreeListenerElement<T>
}

const NanotreeListener = {
  bind(this: NanotreeListenerElement<any>, properties: ElementProperties<any>) {
    for (const [property, value] of Object.entries(properties)) {
      if (value && typeof value === 'object' && (value.subscribe || value[PROPERTY])) {
        this[PROPERTIES] ??= {}
        this[PROPERTIES][property] = value
      } else {
        Setup.setProperty(this, property, value)
      }
    }
    return this
  },
  mount(this: NanotreeListenerElement<any>, _nodes: NanotreeNode | NanotreeNode[]) {
    const nodes = [_nodes].flat(Infinity)
      .flatMap((node) => {
        if (this[SETUP] || !(typeof node === 'object' && COMPONENT in node)) return node
        let unwrapped
        ;(node as any).subscribe((b: any) => unwrapped = b)
        return unwrapped
      }) as NanotreeNode[]
    const children = new Array(nodes.length)
    for (const n in nodes) children[n] = staticNode(nodes[n], nodes.length === 1)
    this.replaceChildren(...children)
    return this
  },
  [SETUP](this: NanotreeListenerElement<any>) {
    delete this[SETUP]

    for (const n of this.childNodes) n?.[SETUP]?.()
    if (this[PROPERTIES]) {
      this[LISTENERS] = Setup.bindAllProperties(this, this[PROPERTIES])
    }

    this[TEARDOWN] = NanotreeListener[TEARDOWN]
  },
  [TEARDOWN](this: NanotreeListenerElement<any>) {
    delete this[TEARDOWN]

    for (const n of this.childNodes) n?.[TEARDOWN]?.()
    if (this[LISTENERS]) {
      for (const l of this[LISTENERS]) l()
      delete this[LISTENERS]
    }

    this[SETUP] = NanotreeListener[SETUP]
  }
}

export function node<
  E extends T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement,
  T extends keyof HTMLElementTagNameMap | (string & {})
>(target: T, bound?: ElementProperties<E>): NanotreeListenerElement<E>
export function node<
  P,
  E extends Record<string, EventHandler<any, any>>
>(target: Component<P, E>, bound?: P): NanotreeComponentElement<P, E>

export function node<
  E extends T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement,
  T extends keyof HTMLElementTagNameMap | (string & {}) | Component<any, any>
>(
  target: T,
  bound?: ElementProperties<E>
) {
  if (typeof target === 'function') {
    const element = component(target)
    if (bound) {
      element.bind(bound)
    }
    return element
  }

  const element = document.createElement(target) as NanotreeListenerElement<E>
  element.bind = NanotreeListener.bind
  element.on = Setup.attachEvents
  element.mount = NanotreeListener.mount
  element[SETUP] = NanotreeListener[SETUP]

  if (bound) {
    ;(element as any).bind(bound)
  }

  return element
}

node.static = function <
  E extends T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement,
  T extends keyof HTMLElementTagNameMap | (string & {})
>(
  target: T,
  bound?: ElementProperties<E>
): NanotreeStaticElement<E> {
  const element = document.createElement(target) as NanotreeStaticElement<E>
  element.bind = NanotreeListener.bind
  element.on = Setup.attachEvents
  element.mount = NanotreeListener.mount

  if (bound) {
    ;(element as any).bind(bound)
  }

  return element
}

interface NanotreeTemplateTargetElement extends HTMLElement {
  [SETUP]?: () => void
  [TEARDOWN]?: () => void
  [LISTENERS]?: (() => void)[]
  [EVENTS]?: ElementEvents<any>
  [NODES]?: NanotreeTemplateTargetElement[]
  [ATOM]?: ReadableAtom<Primitive | CandidateElement>
  [PROPERTY]?: string
  [PROPERTIES]: Record<string, ReadableAtom>
  [CHILDREN]: NanotreeTemplateTagElement<any>[]
}

function targetSetup(this: NanotreeTemplateTargetElement): void {
  delete this[SETUP]
  this[LISTENERS] = Setup.bindAllProperties(this, this[PROPERTIES])
  this[TEARDOWN] = targetTeardown
}

function targetTeardown(this: NanotreeTemplateTargetElement): void {
  delete this[TEARDOWN]
  if (this[LISTENERS]) {
    for (const l of this[LISTENERS]) l()
    delete this[LISTENERS]
  }
  this[SETUP] = targetSetup
}

type NanotreeTemplateTagElement<T extends HTMLElement> = T & {
  [EVENTS]?: ElementEvents<T>
  [NODES]?: (CandidateElement | Primitive | ReadableAtom<CandidateElement | Primitive>) | (CandidateElement | Primitive | ReadableAtom<CandidateElement | Primitive>)[]

  bind(this: NanotreeTemplateTagElement<T>, properties: ElementProperties<T>): NanotreeTemplateTagElement<T>
  mount(this: NanotreeTemplateTagElement<T>, nodes: NanotreeNode | NanotreeNode[]): NanotreeTemplateTagElement<T>
  on(this: NanotreeTemplateTagElement<T>, events: ElementEvents<any>): NanotreeTemplateTagElement<T>
  on(this: NanotreeTemplateTagElement<T>, event: string, listener: EventHandler<any, any>): NanotreeTemplateTagElement<T>
}

function tagOn(this: NanotreeTemplateTagElement<any>, events: ElementEvents<any> | string, listener?: EventHandler<any, any>): NanotreeTemplateTagElement<any> {
  this[EVENTS] = typeof events === 'string' ? { [events]: listener as EventHandler<any, any> } : events
  return this
}

function tagMount(this: NanotreeTemplateTagElement<any>, _nodes: NanotreeNode | NanotreeNode[]): NanotreeTemplateTagElement<any> {
  const nodes = [_nodes].flat(Infinity) as NanotreeNode[]

  this[NODES] = nodes
  this.replaceChildren(
    ...nodes.map((n) => typeof n === 'object' && (PROPERTY in n || 'subscribe' in n) ? document.createComment('') : n)
  )
  return this
}

const NanotreeTemplate = {
  arguments: {
    prop: new Proxy({}, {
      get(_, property) {
        return { [PROPERTY]: property }
      }
    }),
    tag<
      E extends T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement,
      T extends keyof HTMLElementTagNameMap | (string & {})
    >(
      target: T,
      bound?: ElementProperties<E>
    ): NanotreeTemplateTagElement<E> {
      const element = document.createElement(target) as NanotreeTemplateTagElement<E>
      element.bind = NanotreeListener.bind
      element.on = tagOn
      element.mount = tagMount
      if (bound) {
        ;(element as any).bind(bound)
      }
      return element
    }
  },
  resolveEvents(target: CandidateElement, events: ElementEvents<any>, props: ElementProperties<any>): void {
    for (const key in events) {
      const value = events[key]
      if (!Array.isArray(value) && typeof value === 'object' && value[PROPERTY]) {
        Setup.bindEvent(target, key, props[value[PROPERTY]])
      } else {
        Setup.bindEvent(target, key, value!)
      }
    }
  },
  rehydrate(
    candidates: { candidate: NanotreeTemplateTargetElement, index: number }[],
    targets: NanotreeTemplateTargetElement[],
    props: Record<string, any>,
    origin: NanotreeTemplateTargetElement
  ): void {
    for (const { candidate, index } of candidates) {
      const target = targets[index]

      if (candidate[EVENTS]) {
        NanotreeTemplate.resolveEvents(target, candidate[EVENTS], props)
      }

      if (candidate[PROPERTIES]) {
        let bound: Record<string, ReadableAtom> | undefined = undefined
        for (let [key, value] of Object.entries(candidate[PROPERTIES])) {
          value = props[(value as any)[PROPERTY]] ?? value

          if (typeof value === 'object') {
            bound ??= {}
            bound[key] = value
          } else {
            Setup.setProperty(target, key, value)
          }
        }

        if (bound) {
          target[PROPERTIES] = bound
          target[SETUP] = targetSetup
        }
      }

      if (candidate[ATOM]) {
        target[ATOM] = props[(candidate[ATOM] as any)?.[PROPERTY]] ?? candidate[ATOM]
        target[SETUP] = candidate[SETUP]
      }

      if (candidate[PROPERTY]) {
        const child = staticNode(props[candidate[PROPERTY]])
        target.replaceWith(child)
        origin[CHILDREN][index] = child
      }
    }
  },
  [SETUP](this: NanotreeTemplateTargetElement): void {
    delete this[SETUP]
    this[TEARDOWN] = NanotreeTemplate[TEARDOWN]
    for (const c of this[CHILDREN]) c[SETUP]?.()
    if (this[PROPERTIES]) {
      this[LISTENERS] = Setup.bindAllProperties(this, this[PROPERTIES])
    }
  },
  [TEARDOWN](this: NanotreeTemplateTargetElement): void {
    delete this[TEARDOWN]
    this[SETUP] = NanotreeTemplate[SETUP]
    for (const c of this[CHILDREN]) c[TEARDOWN]?.()
    if (this[LISTENERS]) {
      for (const l of this[LISTENERS]) l()
      delete this[LISTENERS]
    }
  }
}

function flattenChildren(node: CandidateElement, arr: CandidateElement[]): CandidateElement[] {
  arr.push(node)
  for (const n of node.childNodes) flattenChildren(n as CandidateElement, arr)
  return arr
}

function flattenCandidates(
  candidate: NanotreeTemplateTargetElement,
  arr: { candidate: NanotreeTemplateTargetElement, index: number }[],
  ref: { index: number }
): { candidate: NanotreeTemplateTargetElement, index: number }[] {
  if (candidate[PROPERTIES] || candidate[EVENTS] || candidate[ATOM] || candidate[PROPERTY]) {
    arr.push({ candidate, index: ref.index })
  }
  ref.index += 1
  if (candidate[NODES]) {
    for (const n of candidate[NODES]) flattenCandidates(n, arr, ref)
  }
  return arr
}

export function template<
  Props extends Record<string, any>
>(cb: (args: {
  prop: Props,
  tag<
    E extends T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement,
    T extends keyof HTMLElementTagNameMap | (string & {})
  >(
    target: T
  ): E
}) => NanotreeTemplateTargetElement): (props: Props) => NanotreeTemplateTargetElement {
  const temp = cb(NanotreeTemplate.arguments as any)

  const candidates = flattenCandidates(temp, [], { index: 0 })

  return function(props: Props) {
    const n = temp.cloneNode(true) as NanotreeTemplateTargetElement
    n[CHILDREN] = flattenChildren(n, [])
    NanotreeTemplate.rehydrate(candidates, n[CHILDREN], props, n)
    n[SETUP] = NanotreeTemplate[SETUP]
    n[CHILDREN].shift()
    return n
  }
}

interface NanotreeTextNode extends Text {
  [ATOM]: ReadableAtom<Primitive>
  [SETUP]?: () => void
  [TEARDOWN]?: () => void
}

function textSetup(this: NanotreeTextNode): void {
  this[TEARDOWN] = this[ATOM].subscribe((value) => {
    this.textContent = value as string
  })
}

export function text(atom: ReadableAtom<Primitive>): NanotreeTextNode {
  const t = document.createTextNode(atom.value as string ?? '') as NanotreeTextNode
  t[ATOM] = atom
  t[SETUP] = textSetup
  return t
}

export function wire(element: CandidateElement): () => void {
  element[SETUP]?.()
  return () => element[TEARDOWN]?.()
}

function component<
  Props extends Record<string, any>,
  Events extends Record<string, EventHandler<any, any>>
>(render: (props: Props, children: NanotreeNode[], events: Events, effect: (release: () => void) => void) => NanotreeNode | NanotreeNode[]): NanotreeComponentElement<Props, Events> {
  const values: {
    props: Props
    events: Events
    cleanups: Set<() => void>
    nodes: NanotreeNode[]
  } = { props: undefined as unknown as Props, events: {} as Events, cleanups: new Set(), nodes: [] }
  const comp = {
    bind(props: Props) {
      values.props = props
      return _comp
    },
    mount(nodes: NanotreeNode | NanotreeNode[]) {
      values.nodes = [nodes].flat() as NanotreeNode[]
      return _comp
    },
    on(events: Events | keyof Events, listener: Events[keyof Events]) {
      if (typeof events === 'string') {
        ;(values.events as any)[events] = listener
      } else {
        Object.keys(events).forEach((key) => {
          ;(values.events as any)[key] = events[key as keyof typeof events]
        })
      }
      return _comp
    },
    subscribe(cb: (node: any) => void): () => void {
      cb(render(
        values.props as Props,
        values.nodes,
        values.events,
        (cleanup) => values.cleanups.add(cleanup))
      )
      return () => {
        values.cleanups.forEach((cb) => cb())
        values.cleanups.clear()
      }
    },
    [COMPONENT]: true
  }
  const _comp = comp as NanotreeComponentElement<Props, Events>
  return _comp
}

export type Component<
  Props,
  Events extends Record<string, EventHandler<any, any>> = {}
> = (props: Props, $children: NanotreeNode[], events: Events, effect: (release: () => void) => void) => NanotreeNode | NanotreeNode[]
interface NanotreeComponentElement<
  Props,
  Events extends Record<string, EventHandler<any, any>> = {}
> extends ReadableAtom<NanotreeNodeList> {
  [COMPONENT]: true
  bind(props: Props): this,
  on<K extends keyof Events>(key: K, listener: Events[K]): this,
  on(events: Events): this,
  mount(nodes: NanotreeNode | NanotreeNode[]): this
}
