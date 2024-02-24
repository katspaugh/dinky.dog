export function Edge() {
  const container = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  let lastFromEl = null
  let lastToEl = null

  return {
    container,

    render: ({ fromEl = lastFromEl, toEl = lastToEl, onClick = null }) => {
      lastFromEl = fromEl
      lastToEl = toEl

      const fromPoint = fromEl.getBoundingClientRect()
      const toPoint = toEl.getBoundingClientRect()
      const fromX = fromPoint.left + fromPoint.width / 2
      const fromY = fromPoint.top + fromPoint.height / 2
      const toX = toPoint.left + toPoint.width / 2
      const toY = toPoint.top + toPoint.height / 2

      container.setAttribute('d', `M ${fromX} ${fromY} C ${fromX + 100} ${fromY} ${toX - 100} ${toY} ${toX} ${toY}`)

      if (onClick) {
        container.onclick = onClick
      }

      return container
    },

    destroy: () => container.remove(),
  }
}
