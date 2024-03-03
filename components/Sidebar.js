import { EditableText } from '../components/EditableText.js'
import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'
import { ConnectedPeers } from '../components/ConnectedPeers.js'

export function Sidebar({ title, setTitle, isLocked, setLocked }) {
  const div = document.createElement('div')
  div.className = 'sidebar'
  div.innerHTML = `<h1>Dinky Dog</h1>`

  const titleInput = EditableText({ onInput: setTitle })
  const h2 = document.createElement('h2')
  h2.appendChild(titleInput.render({ text: title }))
  div.appendChild(h2)

  const content = document.createElement('div')
  div.appendChild(content)

  const details = document.createElement('details')
  details.open = true
  details.innerHTML = `
    <summary>Instructions</summary>
    <p>Double-click anywhere to create an object.</p>
    <p>To remove: drag an object off the screen, or delete its contents and press Escape.</p>
    <p>Drag-n-drop image files to insert a picture.</p>
  `
  div.appendChild(details)

  const footer = document.createElement('footer')
  div.appendChild(footer)

  const toggle = Toggle('Lock 🔒')
  toggle.render({ checked: !!isLocked, onChange: setLocked })
  footer.appendChild(toggle.container)

  const shareLink = ShareLink('🔗 Share link')
  footer.appendChild(shareLink.render())

  const expandButton = document.createElement('button')
  expandButton.className = 'toggle-sidebar'
  div.appendChild(expandButton)

  expandButton.onclick = () => {
    div.classList.toggle('collapsed')
  }

  const allPeers = ConnectedPeers()
  div.appendChild(allPeers.render())

  const userContainer = document.createElement('details')
  userContainer.open = true
  userContainer.innerHTML = `<summary>My avatar</summary>`
  div.appendChild(userContainer)

  return {
    container: div,

    render: ({ peerContainer, myPeer }) => {
      if (peerContainer) {
        allPeers.render({ peer: peerContainer })
      }

      if (myPeer) {
        userContainer.appendChild(myPeer)
      }

      return div
    },

    destroy: () => div.remove(),
  }
}
