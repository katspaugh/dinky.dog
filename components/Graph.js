export function Graph({ onClick }) {
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
      onClick(e)
    },
    { capture: true },
  )

  return {
    container,

    render: ({ node = null, edge = null }) => {
      onResize()

      if (node) {
        pan.appendChild(node)
      }
      if (edge) {
        svg.appendChild(edge)
      }

      return container
    },
  }
}
