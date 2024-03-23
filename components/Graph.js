import { Component, el } from '../utils/dom.js'

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

export function Graph({ width, height, onClickAnywhere, onClick, onDblClick, onPointerUp, onPointerMove, onKeyDown }) {
  const svg = el('svg', { style: { width: '100%', height: '100%', viewBox: `0 0 ${width} ${height}` } })
  const pan = el('div', { style: { width: `${width}px`, height: `${height}px` }, className: 'pan' }, [svg])

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

  const keydownHandler = (e) => onKeyDown(e, wasFocused)
  document.addEventListener('keydown', keydownHandler)

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
      document.removeEventListener('keydown', keydownHandler)
      unsubscribeFocus()
    },
  })
}
