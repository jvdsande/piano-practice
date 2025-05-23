import { atom, computed } from 'nanostores'

import * as Music from '../utils/music.ts'

/* Extracted from MIDI file */
export const $candidateTracks = atom<Note[][]>([[], []])
export const $leftTrack = atom(1)
export const $rightTrack = atom(0)

export const $tracks = computed([$candidateTracks, $leftTrack, $rightTrack], (candidates, left, right) => {
  const leftTrack = candidates[left] ?? []
  const rightTrack = candidates[right] ?? []
  const tracks = [rightTrack, leftTrack].map(Music.computeTempoRatio)

  return {
    right: tracks[0],
    left: tracks[1],
    indexes: {
      right,
      left
    }
  }
})

export const $leftHand = computed($tracks, (t) => t.left)
export const $rightHand = computed($tracks, (t) => t.right)
export const $tempo = atom(120)

/* Derived */
export const $endTime = computed([$rightHand, $leftHand], (right, left) => {
  const notes = [...right, ...left]
  return notes.map((n) => n.start + n.duration).sort((a, b) => a - b)[notes.length - 1] ?? 0
})
