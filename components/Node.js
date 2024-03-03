import { makeDraggable } from '../utils/draggable.js'
import { ConnectorPoint } from './ConnectorPoint.js'
import { ResizeHandle } from './ResizeHandle.js'
import { Colorwheel } from './Colorwheel.js'

export const WIDTH = 120
export const HEIGHT = 60
export const MIN_WIDTH = 100
export const MIN_HEIGHT = 42
const DEFAULT_BACKGROUND = '#fafafa'
const BG_THRESHOLD = 200e3
const BG_Z_INDEX = '1'
const DEFAULT_Z_INDEX = '2'

export function Node(id, { onClick, onInputClick, onOutputClick, onDrag, onResize, onBackgroundChange }) {
  const container = document.createElement('div')
  container.id = `node-${id}`
  container.className = 'node'

  const output = ConnectorPoint('100%', '50%').render()
  container.appendChild(output)
  const inputs = []

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
      } else if (inputs.includes(e.target)) {
        onInputClick(inputs.indexOf(e.target))
      }
      onClick()
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

    inputs,

    output,

    render: ({
      x,
      y,
      width = WIDTH,
      height = HEIGHT,
      background = DEFAULT_BACKGROUND,
      inputsCount = 0,
      children = null,
    }) => {
      const isBackground = background !== DEFAULT_BACKGROUND && width * height >= BG_THRESHOLD

      Object.assign(container.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: background,
        zIndex: isBackground ? BG_Z_INDEX : DEFAULT_Z_INDEX,
      })

      // Render inputs
      if (inputsCount && inputs.length !== inputsCount) {
        inputs.forEach((input) => input.remove())
        inputs.length = 0
        for (let i = 0; i < inputsCount; i++) {
          const button = ConnectorPoint('0', `${((i + 1) / (inputsCount + 1)) * 100}%`).render()
          container.appendChild(button)
          inputs.push(button)
        }
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
