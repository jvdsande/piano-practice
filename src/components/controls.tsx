import { node, $$ } from '@nanotree/core'

import { Actions, elapsed, settings, track } from '../state/index.ts'
import { Player } from '../state/player.ts'

import { InputWrapper, Range } from './helpers.tsx'

import './controls.css'

const ControlsToggle = () => (
  <InputWrapper
    className='controls-toggle'
    $icon={$$.with(settings.$controls, controls => controls ? 'fa-angles-right' : 'fa-angles-left')}
  >
    <button static on:click={Actions.toggleControls} />
  </InputWrapper>
)

const PlayPauseToggle = () => (
  <InputWrapper
    className='play'
    $icon={$$.with(settings.$playing, (playing) => playing ? 'fa-pause' : 'fa-play')}
  >
    <button static hello-world="" on:click={Actions.togglePlay} />
  </InputWrapper>
)

const PlayPauseFullscreenToggle = () => (
  <div static className='play-pause' on:pointerup={Actions.fullscreenClick} />
)

const GuideToggle = () => (
  <InputWrapper
    className='listen'
    $icon={$$.with(settings.$guided, (guided) => guided ? 'fa-microphone' : 'fa-microphone-slash')}
  >
    <button static on:click={Actions.toggleListening} />
  </InputWrapper>
)

const ResetButton = () => (
  <InputWrapper className='reset' $icon={$$.single('fa-rotate-left')}>
    <button static on:click={Actions.reset} />
  </InputWrapper>
)

const OpenButton = () => (
  <InputWrapper
    className='open'
    $icon={$$.single('fa-folder-open')}
  >
    <input static type='file' accept='.mid,.midi' on:change={Actions.loadMidiFile} />
  </InputWrapper>
)

const ProgressBar = () => (
  <Range
    label='Progress'
    className='progress'
    $atom={elapsed.$elapsedTicks}
    $min={$$.single(0)}
    $max={track.$endTime}
    on:input={(tick) => Player.setTick(tick)}
  />
)

export const SettingsButton = () => (
  <InputWrapper className='settings' $icon={$$.single('fa-gear')}>
    <button static on:click={Actions.toggleSettings} />
  </InputWrapper>
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
