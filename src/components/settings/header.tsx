import { $$, node } from '@nanotree/core'

import { Actions } from '../../state'

import { InputWrapper } from '../helpers.tsx'

export const Header = () => (
  <header>
    <span static>Settings</span>
    <InputWrapper className='close' $icon={$$.single('fa-close')}>
      <button on:click={Actions.toggleSettings} />
    </InputWrapper>
  </header>
)
