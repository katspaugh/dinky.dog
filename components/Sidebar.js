import { Menu } from '../components/Menu.js'
import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'
import { randomId } from '../utils/random.js'

export function Sidebar({ onTitleChange, setLocked, savedFlows, onShare }) {
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

    const items = savedFlows.map((flow) => ({ content: flow.title || flow.id, href: `?q=${flow.id}` }))
    items.unshift({ content: '＋ New flow', href: '?q=' + randomId(), separator: true })

    div(flowsMenu.render({ items }))
  }

  // Lock toggle
  const lockToggle = Toggle('Lock')
  div(lockToggle.render({ checked: false, onChange: setLocked }))

  // Share link
  div(ShareLink('🔗 Share link', onShare).render())

  const logo = div(
    Menu('').render({
      items: [
        { content: 'About', href: 'https://dinky.dog/?q=shqk808twlq' },
        { content: 'GitHub', href: 'https://github.com/katspaugh/dinky.dog' },
      ],
    }),
  )
  logo.className = 'logo'

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
