import { Component, css } from '../utils/dom.js'
import { makeDraggable } from '../utils/draggable.js'
import { ConnectorPoint } from './ConnectorPoint.js'
import { ResizeHandle } from './ResizeHandle.js'
import { Colorwheel } from './Colorwheel.js'
import { throttle } from '../utils/debounce.js'

export const MIN_WIDTH = 100
export const MIN_HEIGHT = 42
const INITIAL_WIDTH = 160
const INITIAL_HEIGHT = 75
const MAX_WIDTH = 240
const DEFAULT_BACKGROUND = '#f9f9f9'
const BG_THRESHOLD = 100e3
const BG_Z_INDEX = '1'
const DEFAULT_Z_INDEX = '2'

export function Node(id, { onClick, onInputClick, onOutputClick, onDrag, onResize, onBackgroundChange }) {
  const input = ConnectorPoint('0', '50%').render()
  const output = ConnectorPoint('100%', '50%').render()

  // Color wheel
  const colorwheel = Colorwheel({
    onChange: onBackgroundChange,
  })

  // Resize handle
  const resizeHandle = ResizeHandle({
    onResize: (dx, dy) => {
      onResize(dx, dy, _width, _height)
    },
    onResizeStart: () => {
      _width = container.offsetWidth
      _height = container.offsetHeight
    },
  })

  const component = Component({
    props: {
      id: `node-${id}`,
      className: 'node',
    },
    style: {
      minWidth: `${INITIAL_WIDTH}px`,
      minHeight: `${INITIAL_HEIGHT}px`,
      maxWidth: `${MAX_WIDTH}px`,
      zIndex: DEFAULT_Z_INDEX,
    },
    children: [
      input,
      output,
      resizeHandle.container,
      colorwheel.render({
        color: DEFAULT_BACKGROUND,
      }),
    ],
  })

  // Event listeners
  const { container } = component

  // Drag
  if (onDrag) {
    makeDraggable(container, onDrag)
  }

  // Click
  let onClickElsewhere
  if (onClick) {
    // Click inside the node
    container.addEventListener('click', (e) => {
      if (e.target === output) {
        onOutputClick()
      } else if (e.target === input) {
        onInputClick()
      } else {
        onClick()
        container.classList.add('active')
      }
    })

    // Click elsewhere
    onClickElsewhere = (e) => {
      if (!container.contains(e.target)) {
        container.classList.remove('active')
      }
    }
    document.addEventListener('click', onClickElsewhere)
  }

  let _background
  let _width
  let _height
  let _x
  let _y

  const updatePosition = throttle(() => {
    container.style.transform = `translate(${_x}px, ${_y}px)`
  }, 20)

  return {
    ...component,

    input,

    output,

    render: ({ x, y, width, height, background = DEFAULT_BACKGROUND, children = null }) => {
      // Position
      if (x != null && y != null && (x !== _x || y !== _y)) {
        _x = x
        _y = y
        updatePosition()
      }

      // Size
      if (width != null && height != null && (width !== _width || height !== _height)) {
        const isBackground = background !== DEFAULT_BACKGROUND && width * height >= BG_THRESHOLD
        _width = width
        _height = height
        css(container, {
          maxWidth: '',
          minWidth: `${MIN_WIDTH}px`,
          width: `${width}px`,
          minHeight: `${MIN_HEIGHT}px`,
          height: `${height}px`,
          zIndex: isBackground ? BG_Z_INDEX : DEFAULT_Z_INDEX,
          boxShadow: isBackground ? 'none' : '',
        })
      }

      // Background
      if (background !== _background) {
        _background = background
        container.style.backgroundColor = background
        colorwheel.render({ color: background })
      }

      // Children
      if (children) {
        container.appendChild(children)
      }

      return container
    },

    destroy: () => {
      onClickElsewhere && document.removeEventListener('click', onClickElsewhere)
      component.destroy()
    },
  }
}
