import { Component } from '../utils/dom.js'
import { makeDroppable } from '../utils/droppable.js'

export function DropContainer({ fileTypes, onDrop }) {
  const component = Component({
    style: {
      width: 'max-content',
    },
  })

  makeDroppable({
    container: component.container as HTMLElement,
    fileTypes,
    onDrop,
  })

  return component
}
