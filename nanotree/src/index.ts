import { node } from './node.ts'
import { jsx, jsxFragment } from './jsx.ts'

export * from './node'

;(node as any).jsx = jsx
;(node as any).jsxFragment = jsxFragment
