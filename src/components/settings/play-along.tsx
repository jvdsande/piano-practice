import { $$, node } from '@nanotree/core'

import { settings } from '../../state'

import { Range } from '../helpers.tsx'

const GuidingHand = () => (
  <div>
    <label>
      <span>Guiding hand</span>
      <sl-select value={settings.$guidingHand} on:sl-change={(value: any) => {
        settings.$guidingHand.set(value.currentTarget.value)
      }}>
        <sl-option value="right">Right</sl-option>
        <sl-option value="left">Left</sl-option>
      </sl-select>
    </label>
  </div>
)

const NonGuidingHandOpacity = () => (
  <Range
    label="Non-guiding hand opacity"
    className="non-guiding-opacity"
    $atom={settings.$nonGuidingOpacity}
    $min={$$.single(0)}
    $max={$$.single(100)}
  >
    {$$.with(settings.$nonGuidingOpacity, (d: number) => `${d}%`)}
  </Range>
)

const MicSensibility = () => (
  <Range
    label="Mic. sensitivity"
    className="sensitivity"
    $atom={settings.$sensitivity}
    $min={$$.single(0)}
    $max={$$.single(20)}
    factor={10}
  />
)

export const PlayAlong = () => (
  <section>
    <p static>
      Configure how the application behaves when listening to your playing.
      When guiding mode is activated by pressing the microphone icon on the toolbar,
      the application will listen for the notes played by the guiding hand,
      and the score will only progress when the correct note is played.
    </p>
    <GuidingHand />
    <NonGuidingHandOpacity />

    <p static>
      Below you can set the sensitivity of the microphone when listening for the notes.
      A lower sensitivity will be more accurate but might not hear all your notes, especially higher notes.
      A higher sensitivity will hear more notes but might detect false-positives.
    </p>
    <MicSensibility />
  </section>
)
