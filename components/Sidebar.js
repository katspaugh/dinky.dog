import { EditableText } from '../components/EditableText.js'
import { Toggle } from '../components/Toggle.js'
import { ShareLink } from '../components/ShareLink.js'
import { Fns } from '../expressions/index.js'
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

  const fnNames = Object.keys(Fns)
    .map((name) => `<li>=${name}</li>`)
    .join('')

  const details = document.createElement('details')
  details.open = true
  details.innerHTML = `
    <summary>Instructions</summary>
    <p>Click anywhere to add a node.</p>
    <p>Drag a node off screen to remove.</p>
    <p>Drag-n-drop images.</p>
    <p>Copy the URL to share.</p>
    <h4>Functions</h4>
    <p>Use these functions in the nodes:</p>
    <ul>${fnNames}</ul>
  `
  div.appendChild(details)

  const footer = document.createElement('footer')
  div.appendChild(footer)

  const shareLink = ShareLink('🔗 Share link')
  footer.appendChild(shareLink.render())

  const toggle = Toggle('Lock 🔒')
  toggle.render({ checked: isLocked, onChange: setLocked })
  footer.appendChild(toggle.container)

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
