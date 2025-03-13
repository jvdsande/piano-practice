import Meyda from 'meyda'
import { Debug } from '../utils/debug.ts'

import { Player } from './player.ts'
import * as track from './track.ts'
import * as elapsed from './elapsed.ts'
import * as settings from './settings.ts'

const Lifecycle = {
  played: [] as string[],
  reset: () => {
    Lifecycle.played = []
  }
}

function advanceScore() {
  const endTick = track.$endTime.get()
  const playedNotes = [...Lifecycle.played, Debug.note]
  Lifecycle.reset()
  if (settings.$playing.get()) {
    elapsed.$elapsedTicks.set(Player.getTicks())
  }

  if (Player.getTicks() >= endTick && settings.$playing.get()) {
    Player.pause()
    return
  }

  Player.playNotes(playedNotes)
}

function scheduleScore() {
  requestAnimationFrame(scheduleScore)
  advanceScore()
}

scheduleScore()

let analyzer: ReturnType<Meyda['createMeydaAnalyzer']> | null
let mediaTrack: MediaStreamTrack
function setupAudioStream() {
  if (analyzer) return

  const audioContext = new window.AudioContext()

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const source = audioContext.createMediaStreamSource(stream)
    analyzer = Meyda.createMeydaAnalyzer({
      source,
      audioContext,
      bufferSize: 1024 * 8,
      windowingFunction: 'sine',
      featureExtractors: ['chroma', 'rms'],
      callback: (args: any) => {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        const trigger = Math.round(args.rms * 1000 / settings.$sensitivity.get())

        if (trigger) {
          const played: string[] = []
          args.chroma.forEach((c: number, i: number) => {
            if (c > 0.8) played.push(notes[i])
          })

          if (played.length < 4) {
            played.forEach((p) => Lifecycle.played.push(p))
          }
        }
      }
    })
    mediaTrack = stream.getAudioTracks()[0]
    analyzer.start()
  }).catch(err => {
    console.error('Error accessing audio stream:', err)
  })
}

function teardownAudioStream() {
  analyzer?.stop()
  mediaTrack?.stop()
  analyzer = null
}

function toggleAudioStream(playing: boolean) {
  if (playing) {
    setupAudioStream()
  } else {
    teardownAudioStream()
  }
}

settings.$guided.subscribe(toggleAudioStream)
