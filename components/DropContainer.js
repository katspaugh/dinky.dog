import { makeDroppable } from '../utils/droppable.js'

export function DropContainer({ fileTypes, onDrop }) {
  const container = document.createElement('div')
  container.className = 'drop'

  makeDroppable({
    container,
    fileTypes,
    onDrop,
  })

  return {
    container,

    render: () => container,

    destroy: () => container.remove(),
  }
}
