import { makeDroppable } from '../utils/droppable.js'

export function DropContainer() {
  const container = document.createElement('div')

  return {
    container,

    render: ({ className, fileType, onDrop }) => {
      container.className = className

      makeDroppable({
        container,
        fileType,
        onDrop,
      })
      return container
    },
  }
}
