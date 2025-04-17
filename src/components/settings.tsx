import { node, $$ } from '@nanotree/core'

import { settings } from '../state/index.ts'

import { Tempo } from './settings/tempo.tsx'
import { Header } from './settings/header.tsx'
import { Credits } from './settings/credits.tsx'
import { Advanced } from './settings/advanced.tsx'
import { Playback } from './settings/playback.tsx'
import { PlayAlong } from './settings/play-along.tsx'
import { Appearance } from './settings/appearance.tsx'

import './settings.css'

export const Settings = () => (
  <div id="settings" aria-hidden={$$.with(settings.$settings, s => !s)}>
    <Header />

    <h3 static>Appearance</h3>
    <Appearance />

    <h3 static>Play along</h3>
    <PlayAlong />

    <h3 static>Playback</h3>
    <Playback />

    <h3 static>Tempo</h3>
    <Tempo />

    <h3 static>Advanced</h3>
    <Advanced />

    <h3 static>Credits</h3>
    <Credits />
  </div>
)
