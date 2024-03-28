import { Component, el } from '../utils/dom.js'
import { makeDraggable } from '../utils/draggable.js'

export function ResizeHandle({ onResize, onResizeStart }) {
  const component = Component({
    props: {
      className: 'resize-handle',
    },
    children: [el('div')],
  })

  makeDraggable(component.container, onResize, onResizeStart)

  return component
}
