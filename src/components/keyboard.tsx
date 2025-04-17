import { node, $$ } from '@nanotree/core'

import * as Music from '../utils/music.ts'

import { NoteName, Spark, cx } from './helpers.tsx'
import { keyboard, elapsed, settings } from '../state/index.ts'

import './keyboard.css'

export const Keyboard = () => (
  <div id='keyboard' data-moving={settings.$playing}>
    {$$.map(
      keyboard.$keys,
      (key) => (
        <>
          {key.pitch === 'C' ? <div className='marker' /> : ''}
          <div className={$$.with(
            [elapsed.$played],
            (played) => cx({
              key: true,
              [key.key]: true,
              [key.pitch]: true,
              [Music.stripAccidental(key.pitch)]: true,
              accidental: key.accidental,
              right: played.right.some((sib) => sib.key === key.key),
              left: played.left.some((sib) => sib.key === key.key)
            })
          )}>
            {$$.with(settings.$keyboardNoteNames, display => {
              if (
                display === 'all' ||
                (display === 'cs' && key.pitch === 'C') ||
                (display === 'c4' && key.key === 'C4')
              ) {
                return (
                  <>
                    <Spark />
                    <NoteName key={key} />
                  </>
                )
              }

              return <Spark />
            })}
          </div>
        </>
      )
    )}
  </div>
)
