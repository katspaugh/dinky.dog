export function Edge() {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

  return {
    container: path,

    render: ({ fromEl, toEl, onClick = null }) => {
      const fromPoint = fromEl.getBoundingClientRect()
      const toPoint = toEl.getBoundingClientRect()
      const fromX = fromPoint.left + fromPoint.width / 2
      const fromY = fromPoint.top + fromPoint.height / 2
      const toX = toPoint.left + toPoint.width / 2
      const toY = toPoint.top + toPoint.height / 2

      path.setAttribute('d', `M ${fromX} ${fromY} C ${fromX + 100} ${fromY} ${toX - 100} ${toY} ${toX} ${toY}`)

      if (onClick) {
        path.onclick = onClick
      }

      return path
    },
  }
}
