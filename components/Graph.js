export function Graph({ onClick, onPointerUp, onPointerMove }) {
  const container = document.createElement('div')
  container.className = 'graph'

  const pan = document.createElement('div')
  pan.className = 'pan'
  container.appendChild(pan)

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  pan.appendChild(svg)

  let wasFocused = false
  pan.addEventListener('focusin', (e) => {
    if (e.target.contentEditable) {
      wasFocused = true
    }
  })
  pan.addEventListener('focusout', (e) => {
    if (e.target.contentEditable) {
      setTimeout(() => {
        wasFocused = false
      }, 100)
    }
  })

  pan.addEventListener(
    'click',
    (e) => {
      if (e.target === pan && !wasFocused) {
        const bbox = pan.getBoundingClientRect()
        onClick(e.clientX - bbox.x, e.clientY - bbox.y)
      }
    },
    { capture: true },
  )

  pan.addEventListener('pointermove', (e) => {
    onPointerMove(e.clientX, e.clientY)
  })

  pan.addEventListener('pointerup', (e) => {
    onPointerUp()
  })

  // Scale the SVG on window resize
  const onResize = () => {
    const width = pan.clientWidth
    const height = pan.clientHeight
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('width', `${width}px`)
    svg.setAttribute('height', `${height}px`)
  }

  window.addEventListener('resize', onResize)

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

    destroy: () => {
      container.remove()
      window.removeEventListener('resize', onResize)
    },
  }
}
