import { makeDraggable } from '../utils/draggable.js'
import { ConnectorPoint } from './ConnectorPoint.js'
import { ResizeHandle } from './ResizeHandle.js'
import { Colorwheel } from './Colorwheel.js'

export const MIN_WIDTH = 100
export const MIN_HEIGHT = 42
const INITIAL_WIDTH = 160
const INITIAL_HEIGHT = 75
const MAX_WIDTH = 240
const DEFAULT_BACKGROUND = '#f9f9f9'
const BG_THRESHOLD = 200e3
const BG_Z_INDEX = '1'
const DEFAULT_Z_INDEX = '2'

export function Node(id, { onClick, onInputClick, onOutputClick, onDrag, onResize, onBackgroundChange }) {
  let _background
  let _width
  let _height

  const container = document.createElement('div')
  container.id = `node-${id}`
  container.className = 'node'
  Object.assign(container.style, {
    minWidth: `${INITIAL_WIDTH}px`,
    minHeight: `${INITIAL_HEIGHT}px`,
    maxWidth: `${MAX_WIDTH}px`,
    zIndex: DEFAULT_Z_INDEX,
  })

  const output = ConnectorPoint('100%', '50%').render()
  container.appendChild(output)
  const input = ConnectorPoint('0', '50%').render()
  container.appendChild(input)

  // Color wheel
  const colorwheel = Colorwheel()
  container.appendChild(
    colorwheel.render({
      color: DEFAULT_BACKGROUND,
      onChange: onBackgroundChange,
    }),
  )

  // Event listeners
  if (onClick) {
    // Click
    container.addEventListener('click', (e) => {
      if (e.target === output) {
        onOutputClick()
      } else if (e.target === input) {
        onInputClick()
      } else {
        onClick()
      }
    })
  }

  // Drag
  if (onDrag) {
    makeDraggable(container, onDrag)
  }

  // Resize
  if (onResize) {
    const resizeHandle = ResizeHandle({
      onResize: (dx, dy) => {
        onResize(dx, dy, _width, _height)
      },
      onResizeStart: () => {
        _width = container.offsetWidth
        _height = container.offsetHeight
      },
    })
    container.appendChild(resizeHandle.render())
  }

  return {
    container: container,

    input,

    output,

    render: ({ x, y, width, height, background = DEFAULT_BACKGROUND, children = null }) => {
      const isBackground = background !== DEFAULT_BACKGROUND && width * height >= BG_THRESHOLD

      // Position
      if (x != null && y != null) {
        Object.assign(container.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
      }

      // Size
      if (width != null && height != null) {
        _width = width
        _height = height
        Object.assign(container.style, {
          maxWidth: '',
          minWidth: `${MIN_WIDTH}px`,
          width: `${width}px`,
          minHeight: `${MIN_HEIGHT}px`,
          height: `${height}px`,
          zIndex: isBackground ? BG_Z_INDEX : DEFAULT_Z_INDEX,
        })
      }

      // Background
      if (background !== _background) {
        _background = background
        container.style.backgroundColor = background
      }

      // Children
      if (children) {
        container.appendChild(children)
      }

      // Background color
      if (background) {
        colorwheel.render({ color: background })
      }

      return container
    },

    destroy: () => container.remove(),
  }
}
