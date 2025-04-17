import { atom, computed } from 'nanostores'

import * as Music from '../utils/music.ts'
import * as track from './track.ts'
import * as settings from './settings.ts'

export const $elapsedTicks = atom(0)

export const $played = computed([track.$rightHand, track.$leftHand, $elapsedTicks, settings.$audioOffset], (right, left, elapsedTicks, audioOffset) => {
  const elapsed = elapsedTicks - audioOffset

  const rightPlayed = right.filter((note) => note.start <= elapsed && (note.start + note.duration) > elapsed)
  const leftPlayed = left.filter((note) => note.start <= elapsed && (note.start + note.duration) > elapsed)

  return {
    right: rightPlayed,
    left: leftPlayed
  }
})

const $ratio = computed(settings.$playbackSpeed, (speed) => {
  const base = Music.mapRange(speed, 0, 200, 0.6, 1.4)
  const limit = Math.max(speed / 100, 0.1)

  if (limit < base) return [limit, base]
  return [base, limit]
})

export const $currentBpm = computed([
  settings.$playbackSpeed,
  settings.$adaptiveSpeed,
  settings.$guidingHand,
  track.$tempo,
  $played,
  $ratio
], (speed, adaptiveSpeed, guidingHand, tempo, played, ratio) => {
  const nonGuidingHand = guidingHand === 'right' ? 'left' : 'right'
  const currentRatio = played[guidingHand].map((p) => p.ratio).sort((a, b) => a - b)[0]
  const nonGuidingRatio = played[nonGuidingHand].map((p) => p.ratio).sort((a, b) => a - b)[0]
  const appliedRatio = currentRatio ?? nonGuidingRatio
  const applied = Music.mapRange(appliedRatio, 0, 1, ratio[0], ratio[1]) * 100

  return (adaptiveSpeed ? applied : speed) * tempo / 100
})
