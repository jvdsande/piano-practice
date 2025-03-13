import { computed } from 'nanostores'
import { $$ } from '@nanotree/core'

import * as Music from '../utils/music.ts'
import * as track from './track.ts'

export const $keyboardInfo = computed([track.$rightHand, track.$leftHand], (right, left) => {
  const notes = [...right, ...left]
  const byOctave = notes.sort((a, b) => a.octave - b.octave)
  const minOctave = byOctave[0]?.octave ?? 0
  const maxOctave = byOctave[byOctave.length - 1]?.octave ?? 8

  const inMinOctave = notes.filter((n) => n.octave === minOctave)
    .map(note => Music.stripAccidental(note.pitch))
    .sort((a,b) => Music.octaveNotes.indexOf(a) - Music.octaveNotes.indexOf(b))
  const inMaxOctave = notes.filter((n) => n.octave === maxOctave)
    .map(note => Music.stripAccidental(note.pitch))
    .sort((a,b) => Music.octaveNotes.indexOf(a) - Music.octaveNotes.indexOf(b))

  const minNote = inMinOctave[0] ?? 'A'
  const maxNote = inMaxOctave[inMaxOctave.length - 1] ?? 'C'

  return Music.buildKeyboard(`${minNote}${minOctave}`, `${maxNote}${maxOctave}`)
})

export const $keys = $$.with($keyboardInfo, (info) => info.keys)
