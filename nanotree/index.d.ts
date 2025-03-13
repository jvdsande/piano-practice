/// <reference types="./jsx.d.ts" />
import { Component } from './src/index'

export * from './src/index'
import * as nanotree from './src/index'

declare namespace Nanotree {
  namespace JSX {
    type Element = GlobalJsxElement
    type IntrinsicElements = GlobalJsxIntrinsicElements
    type Component = GlobalJsxComponent
    type ElementType = GlobalJsxElementType
    type LibraryManagedAttributes<C, P> = GlobalJsxLibraryManagedAttributes<C, P>
  }
}

declare global {
  namespace JSX {
    type Element = nanotree.CandidateElement
    type IntrinsicElements = IntrinsicElementMap

    type DynamicElement<K extends keyof HTMLElementTagNameMap> = {
      children?: nanotree.NanotreeNode[] | nanotree.NanotreeNode
      static?: never
    } & nanotree.ElementProperties<HTMLElementTagNameMap[K]> & {
      [key in keyof HTMLElementEventMap as `on:${key}`]?: nanotree.EventListener<HTMLElementTagNameMap[K], key extends keyof HTMLElementEventMap ? HTMLElementEventMap[key] : Event>
    }
    type StaticElement<K extends keyof HTMLElementTagNameMap> = {
      children?: nanotree.PrimitiveNode[] | nanotree.PrimitiveNode
      static: true
    } & nanotree.ElementStaticProperties<HTMLElementTagNameMap[K]> & {
      [key in keyof HTMLElementEventMap as `on:${key}`]?: nanotree.EventListener<HTMLElementTagNameMap[K], key extends keyof HTMLElementEventMap ? HTMLElementEventMap[key] : Event>
    }
    type IntrinsicElement<K extends keyof HTMLElementTagNameMap> = DynamicElement<K> | StaticElement<K>

    type IntrinsicElementMap = {
      [K in keyof HTMLElementTagNameMap]: IntrinsicElement<K>
    }
    type Component<P, E> = nanotree.Component<P, E>
    type ElementType = string | Component<any, any>

    type EventProps<E extends Record<string, (...args: any[]) => any>> = {
      [K in keyof E as `on:${string & K}`]?: E[K];
    };
    type LibraryManagedAttributes<C, P> = C extends Component<infer Pr, infer Ev> ? Pr & EventProps<Ev> : P
  }
}

type GlobalJsxElement = JSX.Element
type GlobalJsxIntrinsicElements = JSX.IntrinsicElements
type GlobalJsxComponent = JSX.Component
type GlobalJsxElementType = JSX.ElementType
type GlobalJsxLibraryManagedAttributes = JSX.LibraryManagedAttributes
