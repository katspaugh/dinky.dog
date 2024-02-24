import { makeDraggable } from '../utils/draggable.js'
import { ConnectorPoint } from './ConnectorPoint.js'
import { ResizeHandle } from './ResizeHandle.js'
import { Colorwheel } from './Colorwheel.js'

export const WIDTH = 120
export const HEIGHT = 60
const DEFAULT_BACKGROUND = '#fafafa'

const noop = () => {}

export function Node(id) {
  const container = document.createElement('div')
  container.className = 'module'

  const setSize = (width, height) => {
    container.style.width = `${width}px`
    container.style.height = `${height}px`
  }

  const setPosition = (x, y) => {
    container.style.left = `${x}px`
    container.style.top = `${y}px`
  }

  const setBackground = (color) => {
    container.style.backgroundColor = color
  }

  const colorwheel = Colorwheel()
  const output = ConnectorPoint('100%', '50%').render()
  const inputs = []

  return {
    container: container,

    inputs,

    output,

    render: ({
      x,
      y,
      width = WIDTH,
      height = HEIGHT,
      inputsCount = 0,
      background = DEFAULT_BACKGROUND,
      children = null,

      onClick = noop,
      onInputClick = noop,
      onOutputClick = noop,
      onDrag = noop,
      onDragEnd = noop,
      onResize = noop,
      onResizeEnd = noop,
      onBackgroundChange = noop,
    }) => {
      // Position & size
      setPosition(x, y)
      setSize(width, height)

      // Render inputs
      for (let i = 0; i < inputsCount; i++) {
        const button = ConnectorPoint('0', `${((i + 1) / (inputsCount + 1)) * 100}%`).render()
        container.appendChild(button)
        inputs.push(button)
      }

      // Render output
      container.appendChild(output)

      // Children
      if (children) {
        children = Array.isArray(children) ? children : [children]
        children.forEach((el) => container.appendChild(el))
      }

      // Event listeners
      container.addEventListener('click', (e) => {
        if (e.target === output) {
          onOutputClick()
        } else if (inputs.includes(e.target)) {
          onInputClick(inputs.indexOf(e.target))
        }
        onClick()
      })

      // Drag
      {
        makeDraggable(
          container,
          (dx, dy) => {
            x += dx
            y += dy
            setPosition(x, y)
            onDrag(Math.round(x), Math.round(y))
          },
          undefined,
          () => onDragEnd(x, y),
        )
      }

      // Resize
      {
        const resizeHandle = ResizeHandle({
          onResize: (dx, dy) => {
            width = Math.max(WIDTH, width + dx)
            height = Math.max(HEIGHT, height + dy)
            setSize(width, height)
            onResize(width, height)
          },

          onResizeEnd: () => {
            onResizeEnd(Math.round(width), Math.round(height))
          },
        })
        container.appendChild(resizeHandle.render())
      }

      // Background color
      {
        setBackground(background)

        container.appendChild(
          colorwheel.render({
            color: background,
            onChange: (color) => {
              setBackground(color)
              onBackgroundChange(color)
            },
          }),
        )
      }

      return container
    },

    destroy: () => container.remove(),
  }
}
