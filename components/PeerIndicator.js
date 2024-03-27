import { Component, el } from '../utils/dom.js'

const COLORS = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99']

export function PeerIndicator(expireDelay = 2000) {
  const avatar = el('div')
  let expireTimer
  let lastClientId

  const component = Component({
    children: [avatar],

    props: {
      className: 'peer',
    },

    style: {
      display: 'none',
    },

    render: ({ clientId }) => {
      if (clientId !== lastClientId) {
        lastClientId = clientId

        if (clientId) {
          const [browser, emoji, rand] = clientId.split('-')
          const color = COLORS[parseInt(rand, 36) % COLORS.length]
          component.container.style = `border-color: ${color}`
          avatar.textContent = emoji
          avatar.title = `Someone on ${browser}`
        }
      }

      if (expireTimer) clearTimeout(expireTimer)

      expireTimer = setTimeout(
        () => {
          component.container.style.display = 'none'
        },
        clientId ? expireDelay : 100,
      )
    },

    destroy: () => {
      if (expireTimer) clearTimeout(expireTimer)
    },
  })

  return component
}
