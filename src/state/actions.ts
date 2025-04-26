import { Midi } from '@tonejs/midi'

import { Player } from './player.ts'

import * as track from './track.ts'
import * as settings from './settings.ts'

export const toggleControls = () => {
  settings.$controls.set(!settings.$controls.get())
}
export const toggleSettings = () => {
  settings.$settings.set(!settings.$settings.get())
}
export const togglePlay = () => {
  if (settings.$playing.get()) {
    Player.pause()
  } else {
    Player.play()
  }
}

export const toggleListening = () => {
  settings.$guided.set(!settings.$guided.get())
}
export const reset = () => {
  Player.reset()
  Player.pause()
  Player.setTick(0)
}
export const loadMidiFile = async (e: any) => {
  const target = e.currentTarget
  const arr = await target.files?.item(0)?.arrayBuffer()
  const midi = new Midi(arr)

  const firstNonZeroNote = midi.tracks[0]?.notes?.findIndex((note) => note.duration)
  const ratio = (midi.tracks[0]?.notes[firstNonZeroNote]?.durationTicks ?? 0) / (midi.tracks[0]?.notes[firstNonZeroNote]?.duration ?? 1)
  const tracks = midi.tracks.map((track) => track.notes.map((note) => ({
    octave: note.octave,
    pitch: note.pitch.replace('♯', '#'),
    key: note.pitch.replace('♯', '#') + note.octave,
    start: note.time * ratio,
    duration: note.duration * ratio,
    ratio: 1
  })))

  reset()
  track.$candidateTracks.set(tracks)
  track.$leftTrack.set(1)
  track.$rightTrack.set(0)
  track.$tempo.set(midi.header.tempos[0]?.bpm ?? 120)

  Player.setMidi(midi)
}

let last = Date.now()
export const fullscreenClick = (e: any) => {
  const target = e.currentTarget as Element
  const width = target.getBoundingClientRect().width
  const clientX = e.clientX
  const position = clientX / width * 100

  const elapsed = Date.now() - last
  last = Date.now()
  const dblclick = elapsed < 200

  if (position > 33 && position < 67 && !dblclick) {
    togglePlay()
  }
  if (dblclick) {
    last = 0
  }
  if (position < 33 && dblclick) {
    Player.rewind()
  }
  if (position > 67 && dblclick) {
    Player.forward()
  }
}
