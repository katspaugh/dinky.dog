import { Menu } from '../components/Menu.js'
import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'

const isMobile = window.matchMedia('(max-width: 600px)').matches
const originalDevicePixelRatio = Math.round(window.devicePixelRatio / (window.screen.availWidth / window.innerWidth))
let pxRatio = originalDevicePixelRatio

function resizeElementToCompensateZoom(element) {
  if (isMobile) return
  const newPxRatio = window.devicePixelRatio
  if (newPxRatio !== pxRatio) {
    pxRatio = newPxRatio
    element.style.transformOrigin = 'top left'
    element.style.transform = `scale(${originalDevicePixelRatio / newPxRatio})`
    element.style.width = 100 * (newPxRatio / originalDevicePixelRatio) + 'vw'
  }
}

export function Sidebar({ title, setTitle, isLocked, setLocked, savedFlows }) {
  const container = document.createElement('div')
  container.className = 'sidebar'

  const div = (node) => {
    const el = document.createElement('div')
    node && el.appendChild(node)
    return container.appendChild(el)
  }

  const allPeers = div()
  allPeers.className = 'peers'

  // Divider
  container.appendChild(document.createElement('hr'))

  // Title input
  {
    const input = document.createElement('input')
    input.type = 'text'
    input.value = title
    input.placeholder = 'Untitled'
    input.oninput = () => setTitle(input.value)
    container.appendChild(input)
  }

  // Flows menu
  {
    const flowsMenu = Menu('Flows')

    const newFlowLink = document.createElement('a')
    newFlowLink.href = '?hello#world'
    newFlowLink.textContent = '＋ New flow'
    flowsMenu.render({
      items: [
        {
          content: newFlowLink,
          separator: true,
        },
      ],
    })

    div(
      flowsMenu.render({
        items: savedFlows.map((flow) => {
          const link = document.createElement('a')
          link.innerText = flow.title || flow.id
          link.href = `?${flow.id}#${flow.hash}`
          return { content: link }
        }),
      }),
    )
  }

  // Lock toggle
  div(Toggle('Lock 🔒').render({ checked: !!isLocked, onChange: setLocked }))

  // Share link
  div(ShareLink('Share link 🔗').render())

  // Call the function on page load and whenever the window is resized
  const onResize = () => resizeElementToCompensateZoom(container)
  window.addEventListener('resize', onResize)

  return {
    container,

    render: ({ title, peer }) => {
      if (peer) {
        allPeers.appendChild(peer)
      }

      if (title) {
        input.value = title
      }

      onResize()

      return container
    },

    destroy: () => {
      container.remove()
      window.removeEventListener('resize', onResize)
    },
  }
}
