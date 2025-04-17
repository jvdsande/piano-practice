import { WritableStore } from 'nanostores'
import { $$, node } from '@nanotree/core'

import { track } from '../../state'

const HandTrackSelector = ({ label, $atom } : { label: string, $atom: WritableStore<number> }) => (
  <label>
    <span>{label}</span>
    <sl-select
      value={$$.with($atom, t => `${t}`)}
      on:sl-change={(value: any) => {
        $atom.set(+value.currentTarget.value)
      }}
    >
      {$$.map(track.$candidateTracks, (_, index) => (
        <sl-option value={`${index}`}>
          Track {index + 1}
        </sl-option>
      ))}
    </sl-select>
  </label>
)

export const Advanced = () => (
  <section>
    <p static>
      If your MIDI file contains more than two tracks, you can select which track to display here.
    </p>

    <div>
      <HandTrackSelector label="Left hand track" $atom={track.$leftTrack} />
      <HandTrackSelector label="Right hand track" $atom={track.$rightTrack} />
    </div>
  </section>
)
