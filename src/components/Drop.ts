import { Component } from '../lib/component.js'
import { makeDroppable } from '../lib/droppable.js'

export type DropEvents = {
  drop: {
    x: number
    y: number
    file: File
  }
}

export type DropProps = {}

export class Drop extends Component<DropProps, DropEvents> {
  constructor() {
    super('div', {
      style: {},
    })

    makeDroppable({
      container: this.container,
      fileTypes: /image\//,
      onDrop: ({ x, y, file }) => {
        this.emit('drop', { x, y, file })
      },
    })
  }

  render() { }
}
