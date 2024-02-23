import { makeDraggable } from '../utils/draggable.js'
import { ConnectorPoint } from './ConnectorPoint.js'
import { ResizeHandle } from './ResizeHandle.js'
import { Colorwheel } from './Colorwheel.js'

const WIDTH = 120
const HEIGHT = 60

export function Node() {
  const container = document.createElement('div')
  container.className = 'module'

  Object.assign(container.style, {
    width: `${WIDTH}px`,
    height: `${HEIGHT}px`,
  })

  const outputButton = ConnectorPoint()
  const inputs = []
  const colorwheel = Colorwheel()

  return {
    container: container,

    inputs,

    output: outputButton.container,

    render: ({
      id,
      x,
      y,
      width = WIDTH,
      height = HEIGHT,
      children = null,
      inputsCount = 0,
      onClick = null,
      onDrag = null,
      onDragEnd = null,
      onResize = null,
      onResizeEnd = null,
      background = null,
      onBackgroundChange = null,
    }) => {
      container.setAttribute('id', id)

      // Position & size
      Object.assign(container.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      })

      // Render inputs
      for (let i = 0; i < inputsCount; i++) {
        const connector = ConnectorPoint()
        const button = connector.render({
          id: `${id}-input-${i}`,
          style: { left: '0', top: `${((i + 1) / (inputsCount + 1)) * 100}%`, transform: 'translateY(-50%)' },
        })
        container.appendChild(button)
        inputs.push(button)
      }

      // Render output
      container.appendChild(
        outputButton.render({ id: `${id}-output`, style: { left: '100%', top: '50%', transform: 'translateY(-50%)' } }),
      )

      // Children
      if (children) {
        children = Array.isArray(children) ? children : [children]
        children.forEach((el) => container.appendChild(el))
      }

      // Event listeners
      container.onclick = onClick

      // Drag
      if (onDrag) {
        let left = x
        let top = y
        makeDraggable(
          container,
          (dx, dy) => {
            left += dx
            top += dy
            Object.assign(container.style, {
              left: `${left}px`,
              top: `${top}px`,
            })
            onDrag(Math.round(left), Math.round(top))
          },
          undefined,
          onDragEnd,
        )
      }

      // Resize
      if (onResize) {
        const resizeHandle = ResizeHandle({
          onResize: (dx, dy) => {
            width = Math.max(WIDTH, width + dx)
            height = Math.max(HEIGHT, height + dy)
            Object.assign(container.style, {
              width: `${width}px`,
              height: `${height}px`,
            })
            onResize(width, height)
          },

          onResizeEnd: () => {
            onResizeEnd && onResizeEnd(Math.round(width), Math.round(height))
          },
        })
        container.appendChild(resizeHandle.render())
      }

      // Background color
      if (background) {
        container.style.backgroundColor = background
      }
      if (onBackgroundChange) {
        container.appendChild(
          colorwheel.render({
            color: background || '#fafafa',
            onChange: (color) => {
              container.style.backgroundColor = color
              onBackgroundChange(color)
            },
          }),
        )
      }

      return container
    },
  }
}
