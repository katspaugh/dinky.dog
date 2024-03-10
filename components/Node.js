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
  let lastBackground

  const container = document.createElement('div')
  container.id = `node-${id}`
  container.className = 'node'
  Object.assign(container.style, {
    minWidth: `${INITIAL_WIDTH}px`,
    minHeight: `${INITIAL_HEIGHT}px`,
    maxWidth: `${MAX_WIDTH}px`,
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
      onChange: (color) => {
        onBackgroundChange(color)
      },
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
        const width = container.offsetWidth
        const height = container.offsetHeight
        onResize(dx, dy, width, height)
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
      if (x !== undefined && y !== undefined) {
        Object.assign(container.style, {
          left: `${x}px`,
          top: `${y}px`,
          zIndex: isBackground ? BG_Z_INDEX : DEFAULT_Z_INDEX,
        })
      }

      // Size
      if (width != null) {
        container.style.maxWidth = ''
        container.style.minWidth = `${MIN_WIDTH}px`
        container.style.width = `${width}px`
      }
      if (height != null) {
        container.style.minHeight = `${MIN_HEIGHT}px`
        container.style.height = `${height}px`
      }

      // Background
      if (background !== lastBackground) {
        lastBackground = background
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
