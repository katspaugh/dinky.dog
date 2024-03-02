let peerCount = 0

export function Peer(id) {
  const container = document.createElement('div')
  const [browser, emoji] = id.split('-')

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
    border: '1px solid #333',
    top: '10px',
    left: 10 + peerCount * 50 + 'px',
    zIndex: '1000',
    cursor: 'default',
    transition: 'background-color 0.3s',
  })
  container.innerText = emoji
  container.title = browser

  peerCount++

  let animationTimer = null

  return {
    container,

    render: () => {
      container.style.backgroundColor = '#aaf'
      if (animationTimer) clearTimeout(animationTimer)
      animationTimer = setTimeout(() => {
        container.style.backgroundColor = '#fff'
      }, 300)

      return container
    },

    destroy: () => {
      container.remove()
      peerCount--
    },
  }
}
