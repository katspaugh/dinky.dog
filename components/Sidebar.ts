import { Component, el } from '../utils/dom.js'
import { Menu } from '../components/Menu.js'
import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'
import { PeerIndicator } from '../components/PeerIndicator.js'
import { makeUrl } from '../persist.js'
import { randomId } from '../utils/random.js'

const PEER_EXPIRATION = 3 * 60e3 // 3 minutes

export function Sidebar({ onTitleChange, setLocked, savedFlows, onShare, onFork }) {
  const children = []
  const peers = {}

  const add: typeof el = (...args) => {
    const child = el(...args)
    children.push(child)
    return child
  }

  const peersContainer = add('div', { className: 'peers' })

  // Divider
  add('hr')

  // Title input
  const input = add('input', {
    type: 'text',
    placeholder: 'Untitled',
    oninput: () => onTitleChange(input.value),
  })

  // Flows menu
  {
    const flowsMenu = Menu('Flows')
    const items = savedFlows.map((flow) => ({ content: flow.title || flow.id, href: makeUrl(flow.id) }))
    items.unshift({ content: '＋ New flow', href: makeUrl(randomId()), separator: true })
    children.push(flowsMenu.render({ items }))
  }

  // Lock toggle
  const lockToggle = Toggle('Lock')
  children.push(lockToggle.render({ checked: false, onChange: setLocked }))

  // Share link
  children.push(ShareLink('🔗 Share link', onShare).render())

  const onForkClick = async () => {
    let id
    try {
      id = await onFork()
    } catch (e) {
      console.error('Failed to fork the flow', e)
      return
    }
    console.log('Forked flow:', id)
    if (id) {
      window.location.href = makeUrl(id)
    }
  }

  children.push(
    Menu('', 'logo').render({
      items: [
        { content: '⑂ Fork flow', separator: true, onClick: onForkClick },
        { content: 'About', href: makeUrl('about-9315ba924c9d16e632145116d69ae72a') },
        { content: 'GitHub', href: 'https://github.com/katspaugh/dinky.dog' },
      ],
    }),
  )

  const component = Component({
    props: { className: 'sidebar' },

    children,

    render: ({ title, isLocked, peerId, peerDisconnected }) => {
      if (isLocked != null) {
        lockToggle.render({ checked: isLocked, onChange: setLocked })
        input.disabled = isLocked
      }

      if (title != null && title !== input.value) {
        input.value = title
      }

      if (peerId) {
        if (peerDisconnected) {
          if (peers[peerId]) {
            peers[peerId].destroy()
            delete peers[peerId]
          }
        } else {
          if (!peers[peerId]) {
            peers[peerId] = PeerIndicator(PEER_EXPIRATION)
            peersContainer.appendChild(peers[peerId].container)
          }
          peers[peerId].render({ clientId: peerId })
        }
      }
    },
  })

  return component
}
