export function stripAccidental(key: string) {
  return key.replace(/[^A-G0-9]/g, '')
}
export function getAccidental(key: string) {
  return key.replace(/[A-G0-9]/g, '')
}

export function buildKeyboard(minNote: string, maxNote: string) {
  minNote = stripAccidental(minNote)
  maxNote = stripAccidental(maxNote)
  const base = [
    ...octave(0),
    ...octave(1),
    ...octave(2),
    ...octave(3),
    ...octave(4),
    ...octave(5),
    ...octave(6),
    ...octave(7),
    ...octave(8)
  ]

  const startIndex = base.findIndex((n) => n.key === 'A0')
  const endIndex = base.findIndex((n) => n.key === 'C8')

  const fullPiano = base.slice(startIndex, endIndex + 1)

  const minIndex = Math.max(
    fullPiano.findIndex((n) => n.key === minNote) - 4,
    0
  )
  const maxIndex = Math.min(
    fullPiano.findIndex((n) => n.key === maxNote) + 4,
    fullPiano.length - 1
  )

  const selectedPiano = fullPiano.slice(minIndex, maxIndex + 1)
  const withAccidentals = accidentals(selectedPiano)

  if (withAccidentals[0].accidental) {
    withAccidentals.shift()
  }
  if (withAccidentals[withAccidentals.length - 1].accidental) {
    withAccidentals.pop()
  }

  return {
    keys: withAccidentals,
    nbWhites: selectedPiano.length,
    nbNotes: withAccidentals.length
  }
}

const pitch = (val: string) => {
  if (val === '@') return 'G'
  if (val === '\x00') return 'A'
  return val
}
const accidentals = (octave: {pitch: string, octave: number, key: string}[]) => {
  return octave.flatMap((key) => {
    if (['C', 'F'].includes(key.pitch)) {
      return { ...key, accidental: false }
    }

    if (['B', 'E'].includes(key.pitch)) {
      return [
        { ...key, accidental: true, key: pitch(String.fromCharCode(key.pitch.charCodeAt(0) - 1)) + '#' + key.octave, pitch: pitch(String.fromCharCode(key.pitch.charCodeAt(0) - 1)) + '#' },
        { ...key, accidental: false }
      ]
    }

    return [
      { ...key, accidental: true, key: pitch(String.fromCharCode(key.pitch.charCodeAt(0) - 1)) + '#' + key.octave, pitch: pitch(String.fromCharCode(key.pitch.charCodeAt(0) - 1)) + '#' },
      { ...key, accidental: false }
    ]
  })
}
export const octaveNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const octave = (n: number) => octaveNotes.map((l) => ({
  pitch: l,
  octave: n,
  key: l + n
}))
export const allNotes = accidentals(octave(0)).map((n) => n.pitch)

export function computeTempoRatio(track: Note[], _: number, tracks: Note[][]) {
  const orderedNotes = tracks[0]
    .filter((n) => n.duration)
    .sort((a, b) => a.duration - b.duration)
  const shortest = orderedNotes[0]?.duration ?? 0
  const longest = orderedNotes[Math.round(orderedNotes.length * (9/10))]?.duration ?? shortest

  return track.map((note) => ({
    ...note,
    ratio: (Math.min(longest, note.duration) - shortest) / (longest - shortest)
  }))
}

export function mapRange(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
  return toMin + ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin);
}
