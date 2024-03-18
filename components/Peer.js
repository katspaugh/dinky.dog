import { Component } from '../utils/dom.js'

const COLORS = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99']
const BG_COLOR = '#fff'

const EXPIRE_DELAY = 5 * 60e3

export function Peer({ id, onExpire, isMe = false }) {
  let animationTimer = null
  let expirationTimer = null

  const [browser, emoji, rand] = id.split('-')
  const color = COLORS[parseInt(rand, 36) % COLORS.length]

  const setBackground = (backgroundColor) => {
    const { container } = component
    container.style.backgroundColor = backgroundColor
  }

  const component = Component({
    props: {
      title: isMe ? `You (${browser})` : `Another peer (${browser})`,
      innerText: emoji,
    },

    style: {
      fontSize: '16px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: `3px solid ${color}`,
      cursor: 'default',
      backgroundColor: BG_COLOR,
      transition: 'background-color 0.3s',
    },

    render: () => {
      setBackground(color)

      // Animation on activity
      if (animationTimer) clearTimeout(animationTimer)
      animationTimer = setTimeout(() => {
        setBackground(BG_COLOR)
      }, 300)

      // Expire after N seconds of inactivity
      if (expirationTimer) clearTimeout(expirationTimer)
      expirationTimer = setTimeout(onExpire, EXPIRE_DELAY)
    },

    destroy: () => {
      if (expirationTimer) clearTimeout(expirationTimer)
      if (animationTimer) clearTimeout(animationTimer)
    },
  })

  return component
}
