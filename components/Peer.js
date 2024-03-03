const COLORS = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99']

const EXPIRE_DELAY = 5 * 60e3

export function Peer({ id, onExpire, isMe = false }) {
  const container = document.createElement('div')
  const [browser, emoji, rand] = id.split('-')
  const color = COLORS[parseInt(rand, 36) % COLORS.length]

  Object.assign(container.style, {
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
    cursor: 'default',
    transition: 'background-color 0.3s',
  })
  container.innerText = emoji
  container.title = isMe ? `You (in ${browser})` : `Viewed by another peer in ${browser}`

  let animationTimer = null
  let expirationTimer = null

  return {
    container,

    render: () => {
      container.style.backgroundColor = color

      // Animation on activity
      if (animationTimer) clearTimeout(animationTimer)
      animationTimer = setTimeout(() => {
        container.style.backgroundColor = '#fff'
      }, 300)

      // Expire after N seconds of inactivity
      if (expirationTimer) clearTimeout(expirationTimer)
      expirationTimer = setTimeout(onExpire, EXPIRE_DELAY)

      return container
    },

    destroy: () => {
      if (expirationTimer) clearTimeout(expirationTimer)
      if (animationTimer) clearTimeout(animationTimer)
      container.remove()
      peerCount--
    },
  }
}
