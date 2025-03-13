/* Keyboard debugging */
import { Actions } from '../state'

export const Debug = { note: '' }
function toNote(pcKey: string) {
  return {
    'q': 'C',
    's': 'D',
    'd': 'E',
    'f': 'F',
    'g': 'G',
    'h': 'A',
    'j': 'B',
    'z': 'C#',
    'e': 'D#',
    't': 'F#',
    'y': 'G#',
    'u': 'A#',
    'v': 'v'
  }[pcKey]
}

document.addEventListener('keydown', (e) => {
  Debug.note = (toNote(e.key as string) as string)
})

document.addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    Actions.reset()
  }

  Debug.note = ''
})
