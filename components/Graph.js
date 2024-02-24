export function Graph({ onClick, onPointerMove }) {
  const container = document.createElement('div')
  container.className = 'graph'

  const pan = document.createElement('div')
  pan.className = 'pan'
  container.appendChild(pan)

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  pan.appendChild(svg)

  const onResize = () => {
    const width = pan.clientWidth
    const height = pan.clientHeight
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('width', `${width}px`)
    svg.setAttribute('height', `${height}px`)
  }

  window.addEventListener('resize', onResize)

  pan.addEventListener(
    'click',
    (e) => {
      if (e.target !== pan) return
      const bbox = pan.getBoundingClientRect()
      onClick(e.clientX - bbox.x, e.clientY - bbox.y)
    },
    { capture: true },
  )

  pan.addEventListener('pointermove', (e) => {
    onPointerMove(e.clientX, e.clientY)
  })

  return {
    container,

    render: ({ node = null, edge = null }) => {
      if (node) {
        pan.appendChild(node)
      }
      if (edge) {
        onResize()
        svg.appendChild(edge)
      }

      return container
    },

    destroy: () => container.remove(),
  }
}
