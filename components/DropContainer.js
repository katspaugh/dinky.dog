import { makeDroppable } from '../utils/droppable.js'

export function DropContainer() {
  const container = document.createElement('div')
  container.className = 'drop'

  return {
    container,

    render: ({ fileTypes, onDrop }) => {
      makeDroppable({
        container,
        fileTypes,
        onDrop,
      })
      return container
    },

    destroy: () => container.remove(),
  }
}
