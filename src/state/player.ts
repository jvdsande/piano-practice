import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'

import * as Music from '../utils/music.ts'
import * as track from './track.ts'
import * as elapsed from './elapsed.ts'
import * as settings from './settings.ts'

class MidiPlayer {
  private midi?: Midi
  private synth: Tone.Sampler
  private currentTick: number = 0
  private awaitedNotes: Set<string> = new Set()
  private onPlayNotes: Set<() => void> = new Set()
  private validNotes: Map<string, boolean> = new Map()

  constructor() {
    this.synth = new Tone.Sampler({
      urls: {
        // A
        'A0': 'A0.mp3',
        'A1': 'A1.mp3',
        'A2': 'A2.mp3',
        'A3': 'A3.mp3',
        'A4': 'A4.mp3',
        'A5': 'A5.mp3',
        'A6': 'A6.mp3',
        'A7': 'A7.mp3',

        // C
        'C1': 'C1.mp3',
        'C2': 'C2.mp3',
        'C3': 'C3.mp3',
        'C4': 'C4.mp3',
        'C5': 'C5.mp3',
        'C6': 'C6.mp3',
        'C7': 'C7.mp3',
        'C8': 'C8.mp3',

        // D#
        'D#1': 'Ds1.mp3',
        'D#2': 'Ds2.mp3',
        'D#3': 'Ds3.mp3',
        'D#4': 'Ds4.mp3',
        'D#5': 'Ds5.mp3',
        'D#6': 'Ds6.mp3',
        'D#7': 'Ds7.mp3',

        // F#
        'F#1': 'Fs1.mp3',
        'F#2': 'Fs2.mp3',
        'F#3': 'Fs3.mp3',
        'F#4': 'Fs4.mp3',
        'F#5': 'Fs5.mp3',
        'F#6': 'Fs6.mp3',
        'F#7': 'Fs7.mp3'
      },
      release: 1,
      baseUrl: '/piano-practice/audio/'
    })
      .toDestination()
  }

  setMidi(midi: Midi) {
    this.midi = midi
    this.setupTransport()
    Tone.start()
  }

  private setupTransport() {
    const midi = this.midi
    if (!midi) return

    Tone.getTransport().cancel()

    Tone.getTransport().bpm.value = midi.header.tempos.length > 0 ? midi.header.tempos[0].bpm : 120
    Tone.getTransport().PPQ = midi.header.ppq

    elapsed.$currentBpm.listen((val) => {
      if (val) {
        Tone.getTransport().bpm.value = val
      }
    })

    midi.tracks.forEach(({ notes }, index) => {
      notes.forEach((note) => {
        Tone.getTransport().schedule((time) => {
          const isActiveHand = index === track.$tracks.get().indexes.right || index === track.$tracks.get().indexes.left
          if (!isActiveHand) return

          const isGuidingHand = index === track.$tracks.get().indexes[settings.$guidingHand.get()]
          const nonGuidingHandVolume = settings.$nonGuidingVolume.get() / 100
          const masterVolume = settings.$masterVolume.get() / 100
          const volume = isGuidingHand ? masterVolume : nonGuidingHandVolume * masterVolume

          const playNote = (t?: number) => this.synth.triggerAttackRelease(
            note.name,
            Tone.Ticks(note.durationTicks).toSeconds(),
            t,
            note.velocity * volume
          )

          if (settings.$guided.get() && isGuidingHand) {
            this.pause()
            this.waitFor(note.pitch, playNote)
          } else {
            playNote(time)
          }
        }, Tone.Ticks(note.ticks).toSeconds())
      })
    })
  }

  private waitFor(pitch: string, playNote: () => void) {
    this.awaitedNotes.add(pitch)
    this.onPlayNotes.add(playNote)
    ;[...Music.allNotes, 'v'].map((note) => {
      this.validNotes.set(note, false)
    })
  }

  public async play() {
    document.querySelector<HTMLAudioElement>('#audio')?.play()

    if (settings.$guided.get() && this.awaitedNotes.size) {
      return
    }

    settings.$playing.set(true)
    Tone.getTransport().start(undefined, Tone.Ticks(this.currentTick).toSeconds())
  }

  public pause() {
    settings.$playing.set(false)
    this.currentTick = Tone.getTransport().ticks
    Tone.getTransport().pause()
  }

  public setTick(tick: number) {
    elapsed.$elapsedTicks.set(tick)
    this.currentTick = tick
    Tone.getTransport().ticks = tick
  }

  public getTicks() {
    return Tone.getTransport().ticks
  }

  public async playNotes(notes: string[]) {
    if (settings.$playing.get() || !settings.$guided.get()) return

    const candidates = [...this.awaitedNotes, 'v']
    const shouldPlay = candidates.some((n) => this.validNotes.get(n) && notes.includes(n))
    ;[...Music.allNotes, 'v'].forEach((note) => {
      if (!notes.includes(note)) {
        this.validNotes.set(note, true)
      }
    })

    if (shouldPlay) {
      const toPlay = [...this.onPlayNotes]
      this.reset()
      await this.play()
      toPlay.forEach(cb => cb())
    }
  }

  public reset() {
    this.onPlayNotes.clear()
    this.awaitedNotes.clear()
  }

  public rewind() {
    Tone.getTransport().seconds = Math.max(0, Tone.getTransport().seconds - 2)
  }

  public forward() {
    Tone.getTransport().seconds = Tone.getTransport().seconds + 2
  }
}

export const Player = new MidiPlayer()
