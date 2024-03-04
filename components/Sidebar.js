import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'

const originalDevicePixelRatio = Math.round(window.devicePixelRatio / (window.screen.availWidth / window.innerWidth))
let pxRatio = originalDevicePixelRatio

function resizeElementToCompensateZoom(element) {
  const newPxRatio = window.devicePixelRatio
  if (newPxRatio !== pxRatio) {
    pxRatio = newPxRatio
    element.style.transformOrigin = 'top left'
    element.style.transform = `scale(${originalDevicePixelRatio / newPxRatio})`
    element.style.height = document.documentElement.clientHeight * newPxRatio + 'px'
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

  const toggle = Toggle('Lock 🔒')
  toggle.render({ checked: !!isLocked, onChange: setLocked })
  footer.appendChild(toggle.container)

  const shareLink = ShareLink('🔗 Share link')
  footer.appendChild(shareLink.render())

  const instructions = document.createElement('details')
  instructions.style.order = '3'
  instructions.className = 'instructions'
  instructions.open = true
  instructions.innerHTML = `
    <summary>Instructions</summary>
    <p>Double-click anywhere to create an object.</p>
    <p>Press Escape to remove an empty node.</p>
    <p>Drag-n-drop image files to insert a picture.</p>
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
  userContainer.innerHTML = `<summary>My avatar</summary>`
  div.appendChild(userContainer)

  // Call the function on page load and whenever the window is resized
  const onResize = () => resizeElementToCompensateZoom(container)
  window.addEventListener('resize', onResize)

  return {
    container,

    render: ({ title, myPeer, children }) => {
      if (title !== undefined && title !== titleInput.value) {
        titleInput.value = title
      }

      if (myPeer) {
        userContainer.appendChild(myPeer)
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
