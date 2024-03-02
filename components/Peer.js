let peerCount = 0

const COLORS = [
  '#ffe8ed',
  '#d6e2e7',
  '#bbeebb',
  '#fefeca',
  '#e1d8f0',
  '#ffd9a3',
  '#d9f3e6',
  '#f2f2fc',
  '#fff2d9',
  '#e4f1ed',
]

export function Peer(id) {
  const container = document.createElement('div')
  const [browser, emoji, rand] = id.split('-')
  const color = COLORS[parseInt(rand, 36) % COLORS.length]

  Object.assign(container.style, {
    position: 'fixed',
    fontSize: '24px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: `3px solid ${color}`,
    top: '10px',
    left: 10 + peerCount * 50 + 'px',
    zIndex: '1000',
    cursor: 'default',
    transition: 'background-color 0.3s',
  })
  container.innerText = emoji
  container.title = browser

  const arrow = document.createElement('div')
  Object.assign(arrow.style, {
    width: '15px',
    height: '15px',
    border: `2px solid ${color}`,
    borderBottom: 'none',
    borderLeft: 'none',
    transform: 'rotate(-90deg) skew(-10deg, -10deg)',
    position: 'fixed',
    left: 0,
    top: 0,
  })
  container.appendChild(arrow)

  peerCount++

  let animationTimer = null

  return {
    container,

    render: ({ pointerX, pointerY } = {}) => {
      container.style.backgroundColor = color
      if (animationTimer) clearTimeout(animationTimer)
      animationTimer = setTimeout(() => {
        container.style.backgroundColor = '#fff'
      }, 300)

      if (pointerX !== undefined && pointerY !== undefined) {
        arrow.style.left = pointerX + 'px'
        arrow.style.top = pointerY + 'px'
      }

      return container
    },

    destroy: () => {
      container.remove()
      peerCount--
    },
  }
}
