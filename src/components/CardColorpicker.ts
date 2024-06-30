import { Colorpicker } from './Colorpicker.js'

export class CardColorpicker extends Colorpicker {
  constructor() {
    super({
      opacity: '0',
      position: 'absolute',
      zIndex: '3',
      top: '-3px',
      right: '0',
      transform: 'translate(0, -100%)',
      transition: 'opacity 0.2s 0.1s',
      pointerEvents: 'all',
      width: '50px',
      height: '20px',
      padding: '0',
      border: 'none',
      borderRadius: '2px',
      backgroundColor: 'var(--card-color)',
    })
  }
}
