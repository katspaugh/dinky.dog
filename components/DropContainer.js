import { Component } from '../utils/dom.js'
import { makeDroppable } from '../utils/droppable.js'

export function DropContainer({ fileTypes, onDrop }) {
  const component = Component({
    props: {
      className: 'drop',
    },
  })

  makeDroppable({
    container: component.container,
    fileTypes,
    onDrop,
  })

  return component
}
