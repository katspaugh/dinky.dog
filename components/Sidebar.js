import { Component, el } from '../utils/dom.js'
import { Menu } from '../components/Menu.js'
import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'
import { makeUrl } from '../persist.js'
import { randomId } from '../utils/random.js'

export function Sidebar({ onTitleChange, setLocked, savedFlows, onShare, onFork }) {
  const children = []
  const add = (...args) => {
    const child = el(...args)
    children.push(child)
    return child
  }
  const addDiv = (children, props = {}) => add('div', props, children)

  const allPeers = addDiv([], { className: 'peers' })

  // Divider
  add('hr')

  // Title input
  const input = add('input', {
    type: 'text',
    placeholder: 'Untitled',
    oninput: (e) => onTitleChange(e.target.value),
  })

  // Flows menu
  {
    const flowsMenu = Menu('Flows')
    const items = savedFlows.map((flow) => ({ content: flow.title || flow.id, href: makeUrl(flow.id) }))
    items.unshift({ content: '＋ New flow', href: makeUrl(randomId()), separator: true })
    addDiv(flowsMenu.render({ items }))
  }

  // Lock toggle
  const lockToggle = Toggle('Lock')
  addDiv(lockToggle.render({ checked: false, onChange: setLocked }))

  // Share link
  addDiv(ShareLink('🔗 Share link', onShare).render())

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

  addDiv(
    Menu('', 'logo').render({
      items: [
        { content: '⑂ Fork flow', separator: true, onClick: onForkClick },
        { content: 'About', href: makeUrl('about-9315ba924c9d16e632145116d69ae72a') },
        { content: 'GitHub', href: 'https://github.com/katspaugh/dinky.dog' },
      ],
    }),
  )

  return Component({
    props: { className: 'sidebar' },
    children,

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
    },
  })
}
