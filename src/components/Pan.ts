import { Component } from '../lib/component.js'
import { getRelativeCoords } from '../lib/dom.js'

export class Pan extends Component {
  constructor({ width, height }: { width: number; height: number }) {
    super('div', {
      style: {
        position: 'absolute',
        width: `${width}px`,
        height: `${height}px`,
      },

      onclick: (e: MouseEvent) => {
        this.output.next({
          event: 'click',
          ...getRelativeCoords(e),
        })
      },

      ondblclick: (e: MouseEvent) => {
        this.output.next({
          event: 'dblclick',
          ...getRelativeCoords(e),
        })
      },

      onpointermove: (e: PointerEvent) => {
        this.output.next({
          event: 'pointermove',
          ...getRelativeCoords(e),
        })
      },
    })
  }
}
