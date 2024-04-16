import { Component, el, css } from '../utils/dom.js'
import { makeDraggable } from '../utils/draggable.js'
import { ResizeHandle } from './ResizeHandle.js'
import { Colorwheel } from './Colorwheel.js'
import { PeerIndicator } from './PeerIndicator.js'
import { throttle } from '../utils/debounce.js'

export const MIN_WIDTH = 100
export const MIN_HEIGHT = 42
const MAX_WIDTH = 200
const DEFAULT_BACKGROUND = '#f9f9f9'
const BG_THRESHOLD = 100e3
const BG_Z_INDEX = '1'
const BG_OPACITY = '0.6'
const ACTIVE_Z_INDEX = '10'

export function DinkyNode(
  id: string,
  { onClick, onInputClick, onOutputClick, onDrag, onResize, onResizeReset, onBackgroundChange },
) {
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
      _width = component.container.offsetWidth
      _height = component.container.offsetHeight
    },
    onResizeReset,
  })

  // Peer indicator
  const peer = PeerIndicator()

  // Content
  const content = el(
    'div',
    {
      className: 'card',

      style: {
        minWidth: `${MIN_WIDTH}px`,
        minHeight: `${MIN_HEIGHT}px`,
        maxWidth: `${MAX_WIDTH}px`,
        backgroundColor: DEFAULT_BACKGROUND,
      },

      onclick: (e) => {
        if (e.target === output) {
          onOutputClick()
        } else if (e.target === input) {
          onInputClick()
        } else {
          onClick()
        }
      },
    },
    [
      input,
      output,
      resizeHandle.container,
      colorwheel.render({
        color: DEFAULT_BACKGROUND,
      }),
      peer.container,
    ],
  )

  // Drag
  if (onDrag) {
    makeDraggable(content, onDrag)
  }

  let _background = DEFAULT_BACKGROUND
  let _width: number
  let _height: number
  let _x: number
  let _y: number
  let _selected = false
  let _lastIsBg = false

  const isBackground = () => _background !== DEFAULT_BACKGROUND && _width * _height >= BG_THRESHOLD

  const updatePosition = throttle(() => {
    component.container.style.transform = `translate(${_x}px, ${_y}px)`
  }, 16)

  const component = Component({
    props: {
      id: `node-${id}`,
      className: 'node',
    },

    children: [content],

    render: ({
      x,
      y,
      width,
      height,
      background = DEFAULT_BACKGROUND,
      children = null,
      selected = false,
      clientId = null,
    }) => {
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
        css(content, {
          maxWidth: '',
          width: `${width}px`,
          height: `${height}px`,
        })
      } else if (width == null && width !== _width && height == null && height !== _height) {
        // Reset size
        _width = width
        _height = height

        css(content, {
          maxWidth: `${MAX_WIDTH}px`,
          width: '',
          height: '',
        })
      }

      // Background
      if (background !== _background) {
        _background = background
        content.style.backgroundColor = background
        colorwheel.render({ color: background })
      }

      // Children
      if (children) {
        content.appendChild(children)
      }

      // Z-index
      const isBg = isBackground()
      if (isBg !== _lastIsBg) {
        _lastIsBg = isBg
        css(component.container, {
          zIndex: isBg ? BG_Z_INDEX : '',
          opacity: isBg ? BG_OPACITY : '',
        })
        content.style.boxShadow = isBg ? 'none' : ''
      }

      // Selected
      if (selected != null && selected !== _selected) {
        _selected = selected
        content.classList.toggle('active', selected)
        component.container.style.zIndex = isBg ? BG_Z_INDEX : selected ? ACTIVE_Z_INDEX : ''
      }

      // Peer indicator
      peer.render({ clientId })
    },
  })

  return {
    ...component,

    input,

    output,
  }
}
