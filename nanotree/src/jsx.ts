import { node } from './node.ts'

export const jsx = (
  Comp: string | ((...args: any[]) => any),
  props: any,
  ...children: any[]
) => {
  props = props ?? {}
  const on: any = {}
  Object.keys(props).forEach((key) => {
    if (key.startsWith('on:')) {
      on[key.slice(3)] = props[key]
      delete props[key]
    }
  })

  if (props.static) {
    delete props.static
    return node.static(Comp as any, props).on(on).mount(children?.flat())
  }

  return node(Comp as any, props).on(on).mount(children?.flat())
}

export const jsxFragment = (_: never, children: any[]) => children
