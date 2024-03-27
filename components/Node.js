import { Component, el, css } from '../utils/dom.js'
import { makeDraggable } from '../utils/draggable.js'
import { ResizeHandle } from './ResizeHandle.js'
import { Colorwheel } from './Colorwheel.js'
import { PeerIndicator } from './PeerIndicator.js'
import { throttle } from '../utils/debounce.js'

export const MIN_WIDTH = 100
export const MIN_HEIGHT = 42
const MAX_WIDTH = 240
const DEFAULT_BACKGROUND = '#f9f9f9'
const BG_THRESHOLD = 100e3
const BG_Z_INDEX = '1'
const DEFAULT_Z_INDEX = '2'
const ACTIVE_Z_INDEX = '10'

export function Node(id, { onClick, onInputClick, onOutputClick, onDrag, onResize, onBackgroundChange }) {
  const input = el('button')
  const output = el('button')

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

  // Peer indicator
  const peer = PeerIndicator()

  const component = Component({
    props: {
      id: `node-${id}`,
      className: 'node',
    },
    style: {
      minWidth: `${MIN_WIDTH}px`,
      minHeight: `${MIN_HEIGHT}px`,
      maxWidth: `${MAX_WIDTH}px`,
      zIndex: DEFAULT_Z_INDEX,
      backgroundColor: DEFAULT_BACKGROUND,
    },
    children: [
      input,
      output,
      resizeHandle.container,
      colorwheel.render({
        color: DEFAULT_BACKGROUND,
      }),
      peer.container,
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
      }
    })
  }

  let _background = DEFAULT_BACKGROUND
  let _width
  let _height
  let _x
  let _y
  let _selected = false
  let _lastIsBg = false

  const isBackground = () => _background !== DEFAULT_BACKGROUND && _width * _height >= BG_THRESHOLD

  const updatePosition = throttle(() => {
    container.style.transform = `translate(${_x}px, ${_y}px)`
  }, 16)

  return {
    ...component,

    input,

    output,

    render: ({ x, y, width, height, background, children = null, selected = false, clientId = null }) => {
      // Position
      if (x != null && y != null && (x !== _x || y !== _y)) {
        _x = x
        _y = y
        updatePosition()
      }

      // Size
      if (width != null && height != null && (width !== _width || height !== _height)) {
        _width = width
        _height = height
        css(container, {
          maxWidth: '',
          width: `${width}px`,
          height: `${height}px`,
        })
      }

      // Background
      if (background !== _background) {
        _background = background
        container.style.backgroundColor = background
        container.style.zIndex = isBackground() ? BG_Z_INDEX : DEFAULT_Z_INDEX
        colorwheel.render({ color: background })
      }

      // Children
      if (children) {
        container.appendChild(children)
      }

      // Z-index
      const isBg = isBackground()
      if (isBg !== _lastIsBg) {
        _lastIsBg = isBg
        css(container, {
          zIndex: isBg ? BG_Z_INDEX : DEFAULT_Z_INDEX,
          boxShadow: isBackground() ? 'none' : '',
        })
      }

      // Selected
      if (selected != null && selected !== _selected) {
        _selected = selected
        container.classList.toggle('active', selected)
        container.style.zIndex = isBg ? BG_Z_INDEX : selected ? ACTIVE_Z_INDEX : DEFAULT_Z_INDEX
      }

      // Peer indicator
      peer.render({ clientId })

      return container
    },

    destroy: () => {
      onClickElsewhere && document.removeEventListener('click', onClickElsewhere)
      component.destroy()
    },
  }
}
