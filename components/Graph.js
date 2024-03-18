import { Component, el } from '../utils/dom.js'
import { makeDraggable } from '../utils/draggable.js'

const SIZE = 3000

const onDocumentFocus = (callback) => {
  let focusTimer = null

  const onFocusIn = (e) => {
    if (e.target.tabIndex != null) {
      if (focusTimer) clearTimeout(focusTimer)
      callback(true)
    }
  }
  const onFocusOut = (e) => {
    if (e.target.tabIndex != null) {
      if (focusTimer) clearTimeout(focusTimer)
      focusTimer = setTimeout(() => {
        callback(false)
      }, 100)
    }
  }
  document.addEventListener('focusin', onFocusIn)
  document.addEventListener('focusout', onFocusOut)

  return () => {
    document.removeEventListener('focusin', onFocusIn)
    document.removeEventListener('focusout', onFocusOut)
  }
}

export function Graph({ onClickAnywhere, onClick, onDblClick, onPointerUp, onPointerMove, onKeyDown }) {
  const svg = el('svg', { style: { width: '100%', height: '100%', viewBox: `0 0 ${SIZE} ${SIZE}` } })
  const pan = el('div', { style: { width: `${SIZE}px`, height: `${SIZE}px` }, className: 'pan' }, [svg])

  let wasFocused = false

  const unsubscribeFocus = onDocumentFocus((focused) => {
    wasFocused = focused
    pan.style.cursor = focused ? 'auto' : ''
  })

  const makeClickHandler = (callback) => (e) => {
    if (e.target === pan) {
      const bbox = pan.getBoundingClientRect()
      callback(e.clientX - bbox.x, e.clientY - bbox.y, wasFocused)
    }
  }

  pan.addEventListener('click', onClickAnywhere, { capture: true })
  pan.addEventListener('click', makeClickHandler(onClick), { capture: true })
  pan.addEventListener('dblclick', makeClickHandler(onDblClick), { capture: true })
  pan.addEventListener('pointermove', (e) => onPointerMove(e.clientX, e.clientY))
  pan.addEventListener('pointerup', onPointerUp)
  pan.addEventListener('pointerleave', onPointerUp)

  document.addEventListener('keydown', onKeyDown)

  makeDraggable(pan, () => {
    // Do nothing, just to prevent clicks after dragging
  })

  return Component({
    props: {
      className: 'graph',
    },

    children: [pan],

    render: ({ node = null, edge = null }) => {
      if (node) {
        pan.appendChild(node)
      }
      if (edge) {
        svg.appendChild(edge)
      }
    },

    destroy: () => {
      document.removeEventListener('keydown', onKeyDown)
      unsubscribeFocus()
      unsubscribeResize()
    },
  })
}
