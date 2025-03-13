import { $$, node } from '@nanotree/core'

import { Actions } from '../../state'

import { Input } from '../helpers.tsx'

export const Header = () => (
  <header>
    <span static>Settings</span>
    <Input className='close' $icon={$$.single('fa-close')}>
      <button on:click={Actions.toggleSettings} />
    </Input>
  </header>
)
