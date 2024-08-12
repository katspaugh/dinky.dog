import { Component } from '../lib/component.js'
import { Button } from './Button.js'

type LockButtonProps = {
  isLocked: boolean
}

type LockButtonEvents = {
  toggle: { isLocked: boolean }
}

export class LockButton extends Component<LockButtonProps, LockButtonEvents> {
  private button: Button

  constructor() {
    const button = new Button('🔒 Lock')

    super(button.container, {
      style: {
        width: '100px',
      },
      onclick: () => {
        this.onClick()
      },
    })

    this.button = button
  }

  private onClick() {
    this.emit('toggle', { isLocked: !this.props.isLocked })
  }

  setProps(props: LockButtonProps) {
    super.setProps(props)
    this.button.setProps({ text: props.isLocked ? '🔓 Unlock' : '🔒 Lock' })
  }
}
