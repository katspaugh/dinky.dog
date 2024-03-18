import { Component, el } from '../utils/dom.js'

export function Edge({ inactive = false } = {}) {
  let lastFromEl = null
  let lastToEl = null

  const component = Component({
    tag: 'path',

    style: {
      pointerEvents: inactive ? 'none' : 'auto',
    },

    render: ({ fromEl = lastFromEl, toEl = lastToEl, onClick }) => {
      lastFromEl = fromEl
      lastToEl = toEl

      const parent = (fromEl.parentElement || toEl.parentElement).parentElement
      if (!parent) return

      const parentBbox = parent.getBoundingClientRect()
      const x = -parentBbox.left
      const y = -parentBbox.top

      const fromPoint = fromEl.getBoundingClientRect()
      const toPoint = toEl.getBoundingClientRect()
      const fromX = x + fromPoint.left + fromPoint.width / 2
      const fromY = y + fromPoint.top + fromPoint.height / 2
      const toX = x + toPoint.left + toPoint.width / 2
      const toY = y + toPoint.top + toPoint.height / 2

      const { container } = component
      container.setAttribute('d', `M ${fromX} ${fromY} C ${fromX + 100} ${fromY} ${toX - 100} ${toY} ${toX} ${toY}`)
      if (onClick) {
        container.onclick = onClick
      }
    },
  })

  return component
}
