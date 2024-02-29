import { makeDraggable } from '../utils/draggable.js'
import { ConnectorPoint } from './ConnectorPoint.js'
import { ResizeHandle } from './ResizeHandle.js'
import { Colorwheel } from './Colorwheel.js'

export const WIDTH = 120
export const HEIGHT = 60
const DEFAULT_BACKGROUND = '#fafafa'
const BG_THRESHOLD = 90e3
const BG_Z_INDEX = 1
const DEFAULT_Z_INDEX = 2

export function Node({
  isLocked,
  onClick,
  onInputClick,
  onOutputClick,
  onDrag,
  onDragEnd,
  onResize,
  onResizeEnd,
  onBackgroundChange,
}) {
  let x = 0
  let y = 0
  let width = WIDTH
  let height = HEIGHT
  let background = DEFAULT_BACKGROUND

  const container = document.createElement('div')
  container.className = 'module'
  container.style.zIndex = DEFAULT_Z_INDEX

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

  const setZIndex = () => {
    const isBackground = !!background && width * height >= BG_THRESHOLD
    container.style.zIndex = isBackground ? BG_Z_INDEX : DEFAULT_Z_INDEX
  }

  const output = ConnectorPoint('100%', '50%').render()
  container.appendChild(output)
  const inputs = []
  const colorwheel = Colorwheel()

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
  if (onDrag && onDragEnd) {
    makeDraggable(
      container,
      (dx, dy) => {
        if (isLocked()) return
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
  if (onResize && onResizeEnd) {
    const resizeHandle = ResizeHandle({
      onResize: (dx, dy) => {
        if (isLocked()) return
        width = Math.max(WIDTH, width + dx)
        height = Math.max(HEIGHT, height + dy)
        setSize(width, height)
        onResize(width, height)
        setZIndex()
      },

      onResizeEnd: () => {
        onResizeEnd(Math.round(width), Math.round(height))
      },
    })
    container.appendChild(resizeHandle.render())
  }

  // Background color
  if (onBackgroundChange) {
    container.appendChild(
      colorwheel.render({
        color: background,
        onChange: (color) => {
          background = color
          setBackground(color)
          onBackgroundChange(color)
          setZIndex()
        },
      }),
    )
  }

  return {
    container: container,

    inputs,

    output,

    render: (props) => {
      x = props.x || x
      y = props.y || y
      width = props.width || width
      height = props.height || height
      background = props.background || background

      // Position & size
      setPosition(x, y)
      setSize(width, height)
      setBackground(background)
      setZIndex()

      // Render inputs
      inputs.forEach((input) => input.remove())
      inputs.length = 0
      for (let i = 0; i < props.inputsCount; i++) {
        const button = ConnectorPoint('0', `${((i + 1) / (props.inputsCount + 1)) * 100}%`).render()
        container.appendChild(button)
        inputs.push(button)
      }

      // Children
      if (props.children) {
        const children = Array.isArray(props.children) ? props.children : [props.children]
        children.forEach((el) => container.appendChild(el))
      }

      return container
    },

    destroy: () => container.remove(),
  }
}
