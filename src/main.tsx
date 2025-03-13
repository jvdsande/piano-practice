import { node, wire, $$ } from '@nanotree/core'

import { keyboard, settings } from './state/index.ts'
import './state/lifecycle.ts'

import { style } from './components/helpers.tsx'
import { Score } from './components/score.tsx'
import { Controls } from './components/controls.tsx'
import { Keyboard } from './components/keyboard.tsx'
import { Landing } from './components/landing.tsx'
import { Settings } from './components/settings.tsx'

import '@shoelace-style/shoelace'

import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@shoelace-style/shoelace/dist/themes/dark.css'

import './style.css'

const Main = (
  <div
    id='main'
    style={$$.with(
      [keyboard.$keyboardInfo, settings.$nonGuidingOpacity],
      (info, nonGuidingOpacity) => style({
        '--nb-notes': info.nbNotes,
        '--nb-whites': info.nbWhites,
        '--non-guiding-hand-opacity': nonGuidingOpacity / 100
      })
    )}
    data-controls={$$.with(settings.$controls, c => c ? 'true' : 'false')}
    data-right={settings.$rightColor}
    data-left={settings.$leftColor}
    data-non-guiding-opacity={$$.with(settings.$nonGuidingOpacity, o => `${o}`)}
    data-guiding-hand={settings.$guidingHand}
  >
    <Landing />
    <Settings />
    <Score />
    <Controls />
    <Keyboard />
  </div>
)

document.getElementById('app')?.replaceChildren(Main)
wire(Main)

