import { node, $$ } from '@nanotree/core'

import { Actions, elapsed, settings, track } from '../state/index.ts'
import { Player } from '../state/player.ts'

import { Input, Range } from './helpers.tsx'

import './controls.css'

const ControlsToggle = () => (
  <Input
    className='controls-toggle'
    $icon={$$.with(settings.$controls, controls => controls ? 'fa-angles-right' : 'fa-angles-left')}
  >
    <button static on:click={Actions.toggleControls} />
  </Input>
)

const PlayPauseToggle = () => (
  <Input
    className='play'
    $icon={$$.with(settings.$playing, (playing) => playing ? 'fa-pause' : 'fa-play')}
  >
    <button static hello-world="" on:click={Actions.togglePlay} />
  </Input>
)

const PlayPauseFullscreenToggle = () => (
  <div static className='play-pause' on:pointerup={Actions.fullscreenClick} />
)

const GuideToggle = () => (
  <Input
    className='listen'
    $icon={$$.with(settings.$guided, (guided) => guided ? 'fa-microphone' : 'fa-microphone-slash')}
  >
    <button static on:click={Actions.toggleListening} />
  </Input>
)

const ResetButton = () => (
  <Input className='reset' $icon={$$.single('fa-rotate-left')}>
    <button static on:click={Actions.reset} />
  </Input>
)

const OpenButton = () => (
  <Input
    className='open'
    $icon={$$.single('fa-folder-open')}
  >
    <input static type='file' accept='.mid,.midi' on:change={Actions.loadMidiFile} />
  </Input>
)

const ProgressBar = () => (
  <Range
    label='Progress'
    className='progress'
    $atom={elapsed.$elapsedTicks}
    $min={$$.single(0)}
    $max={track.$endTime}
    on:input={Player.setTick}
  />
)

export const SettingsButton = () => (
  <Input className='settings' $icon={$$.single('fa-gear')}>
    <button static on:click={Actions.toggleSettings} />
  </Input>
)

export const PlaybackSpeed = ({ withLabels = false }) => (
  <Range
    label='Playback speed'
    className='speed'
    $atom={settings.$playbackSpeed}
    $min={$$.single(0)}
    $max={$$.single(200)}
  >
    {withLabels ? '0.1x' : ''}
    {withLabels ? $$.with(settings.$playbackSpeed, (speed) => `2x - (${Math.max(speed / 100, 0.1)}x)`) : ''}
  </Range>
)

export const Controls = () => (
  <div id='controls'>
    <ProgressBar />
    <ControlsToggle />
    <PlaybackSpeed />
    <PlayPauseFullscreenToggle />
    <PlayPauseToggle />
    <GuideToggle />
    <ResetButton />
    <OpenButton />
    <SettingsButton />
  </div>
)
