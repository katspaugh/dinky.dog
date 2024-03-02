import { EditableText } from '../components/EditableText.js'
import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'
import { sanitizeHtml } from '../utils/parse-text.js'

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
    <p>Double-click anywhere to create a node.</p>
    <p>To remove: drag a node off the screen, or delete its contents and press Escape.</p>
    <p>Drag-n-drop image files to insert a picture.</p>
  `
  div.appendChild(details)

  const footer = document.createElement('footer')
  div.appendChild(footer)

  const toggle = Toggle('Lock 🔒')
  toggle.render({ checked: isLocked, onChange: setLocked })
  footer.appendChild(toggle.container)

  const shareLink = ShareLink('🔗 Share link')
  footer.appendChild(shareLink.render())

  const expandButton = document.createElement('button')
  expandButton.className = 'toggle-sidebar'
  div.appendChild(expandButton)

  expandButton.onclick = () => {
    div.classList.toggle('collapsed')
  }

  return {
    container: div,

    render: ({ description, note = '', onNoteEdit }) => {
      details.open = false
      content.innerHTML = `<h3>${sanitizeHtml(description)}</h3>`

      if (onNoteEdit) {
        const editableText = EditableText({ onInput: onNoteEdit })
        content.appendChild(editableText.render({ text: note }))
      }

      return div
    },

    destroy: () => div.remove(),
  }
}
