import { $$, node } from '@nanotree/core'

import { settings } from '../../state'

const colors = ['red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange']

const HandColor = ({ $atom }: { $atom: typeof settings.$rightColor }) => (
  <sl-select value={$atom} on:sl-change={(value) => $atom.set(value.currentTarget.value as settings.Color)}>
    <div slot="prefix" className="color-swatch"
         style={$$.with($atom, color => `background: var(--color-${color}-6);`)} />
    {colors.map((color) => (
      <sl-option value={color}>
        <div slot="prefix" className="color-swatch" style={`background: var(--color-${color}-6);`} />
        {color[0].toUpperCase() + color.slice(1)}
      </sl-option>
    ))}
  </sl-select>
)

const HandColors = () => (
  <div>
    <label>
      <span>Left hand color</span>
      <HandColor $atom={settings.$leftColor} />
    </label>
    <label>
      <span>Right hand color</span>
      <HandColor $atom={settings.$rightColor} />
    </label>
  </div>
)

const NoteNames = () => (
  <div>
    <label>
      <span>Note names on keys</span>
      <sl-select value={settings.$keyboardNoteNames} on:sl-change={(value: any) => {
        settings.$keyboardNoteNames.set(value.currentTarget.value)
      }}>
        <sl-option value="all">All keys</sl-option>
        <sl-option value="cs">Only Cs</sl-option>
        <sl-option value="c4">Only C4</sl-option>
      </sl-select>
    </label>

    <label>
      <span>Note names on guides</span>
      <sl-select
        value={$$.with(settings.$guideNoteNames, on => on ? 'true' : 'false')}
        on:sl-change={(value: any) => {
          settings.$guideNoteNames.set(value.currentTarget.value === 'true')
        }}
      >
        <sl-option value="true">Yes</sl-option>
        <sl-option value="false">No</sl-option>
      </sl-select>
    </label>
  </div>
)

export const Appearance = () => (
  <section>
    <p static>Customize the look and feel of the application.</p>
    <HandColors />
    <NoteNames />
  </section>
)
