export function Edge({ inactive = false } = {}) {
  const container = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  if (inactive) {
    container.style.pointerEvents = 'none'
  }
  let lastFromEl = null
  let lastToEl = null

  return {
    container,

    render: ({ fromEl = lastFromEl, toEl = lastToEl, onClick = null }) => {
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

      container.setAttribute('d', `M ${fromX} ${fromY} C ${fromX + 100} ${fromY} ${toX - 100} ${toY} ${toX} ${toY}`)

      if (onClick) {
        container.onclick = onClick
      }

      return container
    },

    destroy: () => container.remove(),
  }
}
