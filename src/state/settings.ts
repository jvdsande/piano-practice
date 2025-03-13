import { atom, onNotify } from 'nanostores'
import { persistentAtom } from '@nanostores/persistent'

const boolean = {
  decode: (s: string) => s === 'true',
  encode: (v: boolean) => v ? 'true' : 'false'
}
const number = {
  decode: (s: string) => +s,
  encode: (v: number) => `${v}`
}

export const $settings = atom(false)
export const $playing = atom(false)
export const $controls = persistentAtom('controls', true, boolean)
export const $guided = persistentAtom('guided', false, boolean)
export const $sensitivity = persistentAtom('sensitivity', 5, number)
export const $playbackSpeed = persistentAtom('speed', 100, number)
export const $adaptiveSpeed = persistentAtom('adaptive-speed', false, boolean)
export const $audioOffset = persistentAtom('audio-offset', 0, number)
export const $masterVolume = persistentAtom('master-volume', 100, number)

export type Color = 'red'|'pink'|'grape'|'violet'|'indigo'|'blue'|'cyan'|'teal'|'green'|'lime'|'yellow'|'orange'
export const $rightColor = persistentAtom<Color>('right-color', 'red')
export const $leftColor = persistentAtom<Color>('left-color', 'blue')
export const $nonGuidingOpacity = persistentAtom('non-guiding-opacity', 100, number)
export const $nonGuidingVolume = persistentAtom('non-guiding-volume', 100, number)
export const $guidingHand = persistentAtom<'right' | 'left'>('guiding-hand', 'right')

export const $guideNoteNames = persistentAtom('guide-note-names', true, boolean)
export const $keyboardNoteNames = persistentAtom<'all' | 'cs' | 'c4'>('keyboard-note-names', 'all')

let wakeLock: WakeLockSentinel
onNotify($playing, async () => {
  const playing = $playing.get()
  if (playing) {
    wakeLock = await navigator.wakeLock.request()
  } else {
    wakeLock?.release()
  }
})
