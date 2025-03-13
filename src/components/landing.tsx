import { node, $$ } from '@nanotree/core'

import { Actions, track } from '../state/index.ts'

import { SettingsButton } from './controls.tsx'

import './landing.css'

export const Landing = () => (
  <div
    id='landing'
    aria-hidden={$$.with([track.$candidateTracks], candidates => candidates.flat().length ? 'true' : 'false')}
  >
    <SettingsButton />
    <p static>To start, select a piano score in MIDI format.</p>
    <label>
      <div static>
        <i static className='fa-solid fa-folder-open' />
        Choose file
      </div>
      <input type='file' accept='.mid,.midi' on:change={Actions.loadMidiFile} />
    </label>
  </div>
)
