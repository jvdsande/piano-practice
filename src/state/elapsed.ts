import { atom, computed } from 'nanostores'

import * as Music from '../utils/music.ts'
import * as track from './track.ts'
import * as settings from './settings.ts'

export const $elapsedTicks = atom(0)

const $currentTempo = computed([$elapsedTicks, track.$tempos], (elapsedTicks, tempos) => {
  return ([...tempos]
    .reverse()
    .find(t => t.from < elapsedTicks) ?? tempos[0] ?? { bpm: 120 }).bpm
})

export const $played = computed([track.$rightHand, track.$leftHand, $elapsedTicks, settings.$audioOffset], (right, left, elapsedTicks, audioOffset) => {
  const elapsed = elapsedTicks - audioOffset

  const rightPlayed = right.filter((note) => note.start <= elapsed && (note.start + note.duration) > elapsed)
  const leftPlayed = left.filter((note) => note.start <= elapsed && (note.start + note.duration) > elapsed)

  return {
    right: rightPlayed,
    left: leftPlayed
  }
})

export const $currentRatio = computed([
  settings.$playbackSpeed,
  settings.$adaptiveSpeed,
  settings.$guidingHand,
  $played,
  track.$tempoRatio
], (speed, adaptiveSpeed, guidingHand, played, tempoRatio) => {
  const nonGuidingHand = guidingHand === 'right' ? 'left' : 'right'
  const currentRatio = played[guidingHand].map((p) => p.ratio).sort((a, b) => a - b)[0]
  const nonGuidingRatio = played[nonGuidingHand].map((p) => p.ratio).sort((a, b) => a - b)[0]
  const appliedRatio = currentRatio ?? nonGuidingRatio
  const applied = Music.mapRange(appliedRatio, 0, 1, tempoRatio[0], tempoRatio[1]) * 100

  return (adaptiveSpeed ? applied : speed)
})
export const $currentBpm = computed([$currentTempo, $currentRatio], (currentTempo, ratio) => {
  return currentTempo * ratio / 100
})
