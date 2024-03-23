import { Component, el } from '../utils/dom.js'
import { throttle } from '../utils/debounce.js'

export function Edge({ inactive = false } = {}) {
  let lastFromEl = null
  let lastToEl = null
  let scrollParent = null

  const updatePath = throttle(() => {
    if (!scrollParent) {
      scrollParent = component.container.closest('.graph')
    }
    const { scrollLeft, scrollTop } = scrollParent
    const fromPoint = lastFromEl.getBoundingClientRect()
    const toPoint = lastToEl.getBoundingClientRect()
    const fromX = fromPoint.left + fromPoint.width / 2 + scrollLeft
    const fromY = fromPoint.top + fromPoint.height / 2 + scrollTop
    const toX = toPoint.left + toPoint.width / 2 + scrollLeft
    const toY = toPoint.top + toPoint.height / 2 + scrollTop

    component.container.setAttribute(
      'd',
      `M ${fromX} ${fromY} C ${fromX + 100} ${fromY} ${toX - 100} ${toY} ${toX} ${toY}`,
    )
  }, 20)

  const component = Component({
    tag: 'path',

    style: {
      pointerEvents: inactive ? 'none' : 'auto',
    },

    render: ({ fromEl = lastFromEl, toEl = lastToEl, onClick }) => {
      lastFromEl = fromEl
      lastToEl = toEl

      if (lastFromEl && lastToEl) {
        updatePath()
      }

      if (onClick) {
        component.container.onclick = onClick
      }
    },
  })

  return component
}
