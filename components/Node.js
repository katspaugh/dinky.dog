import { makeDraggable } from '../draggable.js'

export const WIDTH = 100
export const HEIGHT = 50

function makeNodeDraggable(el, onDrag, onDragEnd) {
  let left = null
  let top = null
  makeDraggable(
    el,
    (dx, dy) => {
      if (left == null) {
        const bbox = el.getBoundingClientRect()
        left = bbox.left
        top = bbox.top
      }

      left += dx
      top += dy
      Object.assign(el.style, {
        left: `${left}px`,
        top: `${top}px`,
      })
      onDrag(Math.round(left), Math.round(top))
    },
    undefined,
    onDragEnd,
  )
}

export function Node() {
  const div = document.createElement('div')
  div.className = 'module'

  Object.assign(div.style, {
    position: 'absolute',
    zIndex: 2,
    width: `${WIDTH}px`,
    height: `${HEIGHT}px`,
  })

  const outputButton = document.createElement('button')
  Object.assign(outputButton.style, {
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
  })

  const inputs = []

  const resizeHandle = document.createElement('div')
  Object.assign(resizeHandle.style, {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '10px',
    height: '10px',
    background: 'linear-gradient(135deg, #fff 0%, #fff 50%, #999 50%, #999 100%)',
    cursor: 'nwse-resize',
  })

  return {
    container: div,

    inputs,

    output: outputButton,

    render: ({
      id,
      x,
      y,
      width = WIDTH,
      height = HEIGHT,
      label,
      children = null,
      inputsCount = 0,
      onClick = null,
      onDrag = null,
      onDragEnd = null,
      onResize = null,
      onResizeEnd = null,
    }) => {
      div.setAttribute('id', id)

      Object.assign(div.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      })

      // Render label
      if (label) {
        const span = document.createElement('span')
        span.innerText = label
        Object.assign(span.style, {
          pointerEvents: 'none',
          userSelect: 'none',
        })
        div.appendChild(span)
      }

      // Render inputs
      for (let i = 0; i < inputsCount; i++) {
        const button = document.createElement('button')
        Object.assign(button.style, {
          left: '0',
          top: '50%',
          transform: 'translateY(-50%)',
        })
        button.setAttribute('id', `${id}-input-${i}`)
        div.appendChild(button)
        inputs.push(button)
      }

      // Render output
      outputButton.setAttribute('id', `${id}-output`)
      div.appendChild(outputButton)

      if (children) {
        children = Array.isArray(children) ? children : [children]
        children.forEach((el) => div.appendChild(el))
      }

      div.onclick = onClick

      if (onDrag) {
        makeNodeDraggable(div, onDrag, onDragEnd)
      }

      if (onResize) {
        makeDraggable(
          resizeHandle,
          (dx, dy) => {
            width = Math.max(WIDTH, width + dx)
            height = Math.max(HEIGHT, height + dy)
            Object.assign(div.style, {
              width: `${width}px`,
              height: `${height}px`,
            })
            onResize(width, height)
          },
          undefined,
          () => onResizeEnd && onResizeEnd(Math.round(width), Math.round(height)),
        )
        div.appendChild(resizeHandle)
      }

      return div
    },
  }
}
