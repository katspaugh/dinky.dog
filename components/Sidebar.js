import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'
import { ConnectedPeers } from '../components/ConnectedPeers.js'

const originalDevicePixelRatio = Math.round(window.devicePixelRatio / (window.screen.availWidth / window.innerWidth))
let pxRatio = originalDevicePixelRatio

function resizeElementToCompensateZoom(element) {
  const newPxRatio = window.devicePixelRatio
  if (newPxRatio !== pxRatio) {
    pxRatio = newPxRatio
    element.style.transformOrigin = 'top right'
    element.style.transform = `scale(${originalDevicePixelRatio / newPxRatio})`
    element.style.height = Math.round(document.documentElement.clientHeight * newPxRatio) + 'px'
  }
}

export function Sidebar({ title, setTitle, isLocked, setLocked }) {
  const container = document.createElement('div')
  container.className = 'sidebar'
  if (isLocked) container.classList.add('collapsed')

  const div = document.createElement('div')
  div.className = 'flex'
  div.innerHTML = `<h1>Dinky Dog</h1>`
  container.appendChild(div)

  const titleInput = document.createElement('input')
  titleInput.className = 'title'
  titleInput.value = title || ''
  titleInput.placeholder = 'Untitled flow'
  titleInput.oninput = (e) => setTitle(e.target.value)
  div.appendChild(titleInput)

  const footer = document.createElement('footer')
  div.appendChild(footer)

  const shareLink = ShareLink('🔗 Share link')
  footer.appendChild(shareLink.render())

  const toggle = Toggle('Lock 🔒')
  toggle.render({ checked: !!isLocked, onChange: setLocked })
  footer.appendChild(toggle.container)

  const instructions = document.createElement('details')
  instructions.style.order = '3'
  instructions.className = 'instructions'
  instructions.open = true
  instructions.innerHTML = `
    <summary>Instructions</summary>
    <p>＋ Click anywhere to <b>create</b> an object.</p>
    <p>〰 <b>Connect</b> to other objects by clicking on the circle.</p>
    <p>␛ To <b>remove</b> an object, drag it off the screen, or press Escape on an empty object.</p>
    <p>🀙 Drag-n-drop image files to <b>insert</b> a picture.</p>
  `
  div.appendChild(instructions)

  const expandButton = document.createElement('button')
  expandButton.className = 'toggle-sidebar'
  div.appendChild(expandButton)
  expandButton.onclick = () => {
    container.classList.toggle('collapsed')
  }

  const userContainer = document.createElement('details')
  userContainer.style.order = '2'
  userContainer.open = true
  const allPeers = ConnectedPeers()
  userContainer.innerHTML = `<summary>Viewers</summary>`
  userContainer.appendChild(allPeers.render())
  div.appendChild(userContainer)

  // Call the function on page load and whenever the window is resized
  const onResize = () => resizeElementToCompensateZoom(container)
  window.addEventListener('resize', onResize)

  return {
    container,

    render: ({ title, peer, children }) => {
      if (title !== undefined && title !== titleInput.value) {
        titleInput.value = title
      }

      if (peer) {
        allPeers.render({ peer })
      }

      if (children) {
        div.appendChild(children)
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
