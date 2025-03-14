import { AnyStore, WritableStore } from 'nanostores'
import { $$, node, NanotreeNode } from '@nanotree/core'

import * as Music from '../utils/music'

export const style = (style: Record<string, number | string>) => {
  return Object.entries(style).map(([key, value]) => `${key}: ${value};`).join(' ')
}
export const cx = (classes: Record<string, boolean>) => {
  return Object.entries(classes).map(([key, value]) => value ? key : '').filter((c) => c).join(' ')
}

export const NoteName = ({ key } : { key: Pick<Note, 'pitch' | 'octave'> }) => (
  <section static>
    <span static>{Music.stripAccidental(key.pitch)}</span>
    <span static>{Music.getAccidental(key.pitch)}</span>
    <span static>{key.octave}</span>
  </section>
)

export const Spark = () => <div static className="spark" />

export const Input = (
  { className, $icon }: { className: string, $icon: AnyStore<string> },
  $children: NanotreeNode[]
) => (
  <label className={className}>
    <i className={$$.with([$icon], c => `fa-solid ${c}`)} />
    {$children}
  </label>
)

export const Range = (
  {
    label,
    className,
    $atom,
    $min,
    $max,
    factor = 1
  }: {
    label: string,
    className: string,
    $atom: WritableStore<number>,
    $min: AnyStore<number>,
    $max: AnyStore<number>,
    factor?: number
  },
  $children: NanotreeNode[],
  events: {
    input?: (value: number) => void
  }
) => (
  <label>
    {label}
    <small>{$children.length > 1 ? $children[0] : ''}</small>
    <input
      className={className}
      type="range"
      min={$$.with([$min], m => m * factor)}
      max={$$.with([$max], m => m * factor)}
      value={$$.with([$atom], m => m * factor)}
      on:input={(e) => {
        $atom.set(+e.currentTarget.value)
        events.input?.(+e.currentTarget.value)
      }}
    />
    <small>{$children[1] ?? $children[0] ?? ''}</small>
  </label>
)
