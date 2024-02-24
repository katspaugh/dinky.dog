import { makeDraggable } from '../utils/draggable.js'

export function ResizeHandle({ onResize, onResizeEnd }) {
  const container = document.createElement('div')

  Object.assign(container.style, {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '10px',
    height: '10px',
    background: 'linear-gradient(135deg, transparent 0%, transparent 50%, #999 50%, #999 100%)',
    cursor: 'nwse-resize',
  })

  if (onResize) {
    makeDraggable(container, onResize, undefined, onResizeEnd)
  }

  return {
    container,

    render: () => container,

    destroy: () => container.remove(),
  }
}
