import { ReadableAtom } from 'nanostores'
import { CandidateElement } from './index.ts'

export type Primitive = string | number | boolean

export type PrimitiveNode = Primitive | CandidateElement
export type NanotreeNode = PrimitiveNode | ReadableAtom<NanotreeNode | ReadonlyArray<NanotreeNode>>

export type EventListener<Target, Event> = (this: Target, ev: Event extends { currentTarget: any } ? Event & { currentTarget: Target } : Event) => any
export type EventHandler<Target, Event> =
  | EventListener<Target, Event>
  | [
  EventListener<Target, Event>,
  AddEventListenerOptions,
]

export type NonFunction<T extends {}> = {
  [k in keyof T]: NonNullable<T[k]> extends (...args: any[]) => any ? never : k
}[keyof T]

type ReactiveProperties<Element extends HTMLElement> = Omit<{
  [key in | NonFunction<Element>
    | `${string}-${string}`]?: key extends keyof Element
    ? Element[key] | ReadableAtom<Element[key]>
    : Primitive | ReadableAtom<Primitive>
}, 'style' | 'min' | 'max' | 'value'>
type AdditionalProperties<Element extends HTMLElement> = {
  style?: string | ReadableAtom<string>
  min?: 'min' extends keyof Element ? string | number | ReadableAtom<string | number> : never
  max?: 'max' extends keyof Element ? string | number | ReadableAtom<string | number> : never
  value?: 'value' extends keyof Element ? string | number | ReadableAtom<string | number> : never
}
type StaticProperties<Element extends HTMLElement> = Omit<{
  [key in | NonFunction<Element>
    | `${string}-${string}`]?: key extends keyof Element
    ? Element[key]
    : Primitive
}, 'style' | 'min' | 'max' | 'value'>
type StaticAdditionalProperties<Element extends HTMLElement> = {
  style?: string
  min?: 'min' extends keyof Element ? string | number : never
  max?: 'max' extends keyof Element ? string | number : never
  value?: 'value' extends keyof Element ? string | number : never
}

export type ElementProperties<Element extends HTMLElement> = ReactiveProperties<Element> & AdditionalProperties<Element>
export type ElementStaticProperties<Element extends HTMLElement> = StaticProperties<Element> & StaticAdditionalProperties<Element>


export type ElementEvents<Element extends HTMLElement> = {
  [key in keyof HTMLElementEventMap | string]?: EventHandler<
    Element,
    key extends keyof HTMLElementEventMap ? HTMLElementEventMap[key] : Event
  >
}
