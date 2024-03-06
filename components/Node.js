import { makeDraggable } from '../utils/draggable.js'
import { ConnectorPoint } from './ConnectorPoint.js'
import { ResizeHandle } from './ResizeHandle.js'
import { Colorwheel } from './Colorwheel.js'

export const WIDTH = 180
export const HEIGHT = 75
export const MIN_WIDTH = 100
export const MIN_HEIGHT = 42
const DEFAULT_BACKGROUND = '#f9f9f9'
const BG_THRESHOLD = 200e3
const BG_Z_INDEX = '1'
const DEFAULT_Z_INDEX = '2'

export function Node(id, { onClick, onInputClick, onOutputClick, onDrag, onResize, onBackgroundChange }) {
  const container = document.createElement('div')
  container.id = `node-${id}`
  container.className = 'node'

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
    const resizeHandle = ResizeHandle({ onResize })
    container.appendChild(resizeHandle.render())
  }

  return {
    container: container,

    input,

    output,

    render: ({ x, y, width = WIDTH, height = HEIGHT, background = DEFAULT_BACKGROUND, children = null }) => {
      const isBackground = background !== DEFAULT_BACKGROUND && width * height >= BG_THRESHOLD

      Object.assign(container.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: background,
        zIndex: isBackground ? BG_Z_INDEX : DEFAULT_Z_INDEX,
      })

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
