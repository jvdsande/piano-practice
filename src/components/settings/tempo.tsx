import { node } from '@nanotree/core'

import { settings } from '../../state'

import { PlaybackSpeed } from '../controls.tsx'

const AdaptiveMode = () => (
  <label>
    Enable adaptive mode
    <sl-switch
      checked={settings.$adaptiveSpeed}
      on:sl-change={(e: any) => {
        settings.$adaptiveSpeed.set(e.currentTarget.checked)
      }}
    />
  </label>
)

export const Tempo = () => (
  <section>
    <p static>
      During practice, you can adapt the score's tempo to your level of ease.
      There are two tempo modification mode: <i>linear</i>, where each note will be elongated or shortened by the same ratio;
      and <i>adaptive</i>, where shorter notes are elongated more than longer notes when sped down,
      and longer notes are shortened more than shorter notes when sped up.
    </p>
    <p static>
      Adaptive mode might feel a bit more natural by avoiding very long or very short notes.
    </p>

    <AdaptiveMode />
    <PlaybackSpeed />
  </section>
)
