import { Store } from 'nanostores'

import { node, $$ } from '@nanotree/core'

import * as Music from '../utils/music.ts'
import { elapsed, keyboard, track, settings } from '../state'

import { NoteName, style, cx } from './helpers.tsx'

import './score.css'

const TICK_PER_PIXEL = 4

const HandScore = ({ hand, $hand }: { hand: 'right' | 'left', $hand: Store<Note[]> }) => (
  <div className={hand}>
    {$$.map($hand, (note => (
      <div
        className={cx({
          note: true,
          accidental: Music.stripAccidental(note.pitch) !== note.pitch,
          [Music.stripAccidental(note.pitch)]: true
        })}
        style={$$.with(keyboard.$keyboardInfo, (info) => {
          const key = info.keys.find(k => k.key === note.key)

          if (!key) return ''

          const directIndex = info.keys.indexOf(key)
          const nextKey = info.keys[directIndex + 1]
          const noteKey = key.accidental ? nextKey : key

          const index = info.keys.filter(k => !k.accidental).indexOf(noteKey)
          const left = index * 100 / info.nbWhites

          return style({
            height: `${note.duration / TICK_PER_PIXEL}px`,
            bottom: `${note.start / TICK_PER_PIXEL}px`,
            left: `${left}%`
          })
        })}
      >
        {$$.if(settings.$guideNoteNames, <NoteName key={note} />)}
      </div>
    )))}
  </div>
)


export const Score = () => (
  <div
    id="score"
    style={$$.with(
      [elapsed.$elapsedTicks, settings.$audioOffset, settings.$guided],
      (ad, offset, guided) => style({
        transform: `translateY(${(ad - (!guided ? offset : 30) - 20) / TICK_PER_PIXEL}px)`
      })
    )}
  >
    <HandScore hand="right" $hand={track.$rightHand} />
    <HandScore hand="left" $hand={track.$leftHand} />
  </div>
)
