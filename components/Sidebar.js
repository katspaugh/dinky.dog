import { Menu } from '../components/Menu.js'
import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'

export function Sidebar({ title, setTitle, isLocked, setLocked, savedFlows }) {
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
    input.value = title || ''
    input.placeholder = 'Untitled'
    input.oninput = () => setTitle(input.value)
    container.appendChild(input)
  }

  // Flows menu
  {
    const flowsMenu = Menu('Flows')

    const items = savedFlows.map((flow) => ({ content: flow.title || flow.id, href: `?${flow.id}#${flow.hash}` }))
    items.unshift({ content: '＋ New flow', href: '?hello#world', separator: true })

    div(flowsMenu.render({ items }))
  }

  // Lock toggle
  div(Toggle('Lock 🔒').render({ checked: !!isLocked, onChange: setLocked }))

  // Share link
  div(ShareLink('Share link 🔗').render())

  const logo = div(
    Menu('').render({
      items: [
        { content: 'About', href: 'https://dinky.dog/?hello#64o1g9qtooo' },
        { content: 'GitHub', href: 'https://github.com/katspaugh/dinky.dog' },
      ],
    }),
  )
  logo.className = 'logo'

  return {
    container,

    render: ({ title, peer }) => {
      if (peer) {
        allPeers.appendChild(peer)
      }

      if (title) {
        input.value = title
      }

      return container
    },

    destroy: () => {
      container.remove()
    },
  }
}
