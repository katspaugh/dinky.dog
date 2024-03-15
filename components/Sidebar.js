import { Menu } from '../components/Menu.js'
import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'
import { makeUrl } from '../persist.js'
import { randomId } from '../utils/random.js'

export function Sidebar({ onTitleChange, setLocked, savedFlows, onShare, onFork }) {
  const container = document.createElement('div')
  container.className = 'sidebar'

  const div = (node) => {
    const el = document.createElement('div')
    if (node) {
      el.appendChild(node)
    }
    return container.appendChild(el)
  }

  const allPeers = div()
  allPeers.className = 'peers'

  // Divider
  container.appendChild(document.createElement('hr'))

  // Title input
  const input = document.createElement('input')
  {
    input.type = 'text'
    input.placeholder = 'Untitled'
    input.oninput = () => onTitleChange(input.value)
    container.appendChild(input)
  }

  // Flows menu
  {
    const flowsMenu = Menu('Flows')

    const items = savedFlows.map((flow) => ({ content: flow.title || flow.id, href: makeUrl(flow.id) }))
    items.unshift({ content: '＋ New flow', href: makeUrl(randomId()), separator: true })

    div(flowsMenu.render({ items }))
  }

  // Lock toggle
  const lockToggle = Toggle('Lock')
  div(lockToggle.render({ checked: false, onChange: setLocked }))

  // Share link
  div(ShareLink('🔗 Share link', onShare).render())

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

  const logo = div(
    Menu('', 'logo').render({
      items: [
        { content: '⑂ Fork flow', separator: true, onClick: onForkClick },
        { content: 'About', href: makeUrl('about-9315ba924c9d16e632145116d69ae72a') },
        { content: 'GitHub', href: 'https://github.com/katspaugh/dinky.dog' },
      ],
    }),
  )

  return {
    container,

    render: ({ title, isLocked, peer }) => {
      if (isLocked != null) {
        lockToggle.render({ checked: isLocked, onChange: setLocked })
        input.disabled = isLocked
      }

      if (title != null && title !== input.value) {
        input.value = title
      }

      if (peer) {
        allPeers.appendChild(peer)
      }

      return container
    },

    destroy: () => {
      container.remove()
    },
  }
}
