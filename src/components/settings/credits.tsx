import { node } from '@nanotree/core'

const Link = ({ link }: { link: string }) => (
  <a static href={link} rel='noopener noreferrer' target='_blank'>
    {link}
  </a>
)

export const Credits = () => (
  <section static>
    <p static>
      Audio samples by Alexander Holm, CC-by{': '}
      <Link link='https://creativecommons.org/licenses/by/3.0/' />
      {' ('}
      <Link link='https://github.com/Tonejs/audio/tree/master/salamander' />
      )
    </p>
    <p static>
      Audio playback and MIDI parsing by Tone.js{': '}
      <Link link='https://tonejs.github.io/' />
    </p>
    <p static>
      Audio detection by Meyda{': '}
      <Link link='https://meyda.js.org/' />
    </p>
  </section>
)
