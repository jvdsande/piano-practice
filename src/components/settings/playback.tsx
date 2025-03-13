import { $$, node } from '@nanotree/core'

import { settings } from '../../state'

import { Range } from '../helpers.tsx'

const MasterVolume = () => (
  <Range
    label="Master volume"
    className="master-volume"
    $atom={settings.$masterVolume}
    $min={$$.single(0)}
    $max={$$.single(100)}
  >
    {$$.with(settings.$masterVolume, (d: number) => `${d}%`)}
  </Range>
)

const NonGuidingHandVolume = () => (
  <Range
    label="Non-guiding hand volume"
    className="non-guiding-volume"
    $atom={settings.$nonGuidingVolume}
    $min={$$.single(0)}
    $max={$$.single(100)}
  >
    {$$.with(settings.$nonGuidingVolume, (d: number) => `${d}%`)}
  </Range>
)

const LatencyOffset = () => (
  <Range
    label="Latency offset"
    className="latency"
    $atom={settings.$audioOffset}
    $min={$$.single(0)}
    $max={$$.single(200)}
  />
)

export const Playback = () => (
  <section>
    <p static>Configure the playback of the score.</p>
    <MasterVolume />
    <NonGuidingHandVolume />

    <p static>
      When using a bluetooth headset, you can experience a latency between the sound and the visual score progression.
      You can adjust the latency offset here to try and sync-up the score and the sound.
    </p>
    <LatencyOffset />
  </section>
)
