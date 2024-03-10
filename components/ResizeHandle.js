import { makeDraggable } from '../utils/draggable.js'

export function ResizeHandle({ onResize }) {
  const container = document.createElement('div')
  container.className = 'resize-handle'

  for (let i = 0; i < 2; i++) {
    const div = document.createElement('div')
    container.appendChild(div)
  }

  if (onResize) {
    makeDraggable(container, onResize)
  }

  return {
    container,

    render: () => container,

    destroy: () => container.remove(),
  }
}
