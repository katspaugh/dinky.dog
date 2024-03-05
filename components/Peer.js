const COLORS = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99']

const EXPIRE_DELAY = 5 * 60e3

export function Peer({ id, onExpire, isMe = false }) {
  const [browser, emoji, rand] = id.split('-')
  const color = COLORS[parseInt(rand, 36) % COLORS.length]

  const container = document.createElement('div')
  container.title = isMe ? `You (${browser})` : `Another peer (${browser})`

  Object.assign(container.style, {
    width: '40px',
  })

  const emojiSpan = document.createElement('span')
  Object.assign(emojiSpan.style, {
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
  emojiSpan.innerText = emoji
  container.appendChild(emojiSpan)

  const title = document.createElement('div')
  title.innerText = isMe ? 'You' : browser.split('/')[0]
  Object.assign(title.style, {
    fontSize: '9px',
    textAlign: 'center',
    marginTop: '4px',
    whiteSpace: 'nowrap',
  })
  container.appendChild(title)

  let animationTimer = null
  let expirationTimer = null

  return {
    container,

    render: () => {
      emojiSpan.style.backgroundColor = color

      // Animation on activity
      if (animationTimer) clearTimeout(animationTimer)
      animationTimer = setTimeout(() => {
        emojiSpan.style.backgroundColor = '#fff'
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
    },
  }
}
