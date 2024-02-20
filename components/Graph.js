export function Graph() {
  const div = document.createElement('div')
  div.className = 'graph'
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  div.appendChild(svg)

  return {
    container: div,

    render: ({ node = null, edge = null }) => {
      const { width, height } = div.getBoundingClientRect()
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      svg.setAttribute('width', `${width}px`)
      svg.setAttribute('height', `${height}px`)

      if (node) {
        div.appendChild(node)
      }
      if (edge) {
        svg.appendChild(edge)
      }
    },
  }
}
