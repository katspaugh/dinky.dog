import { EditableText } from '../components/EditableText.js'
import { Toggle } from '../components/Toggle.js'
import { Fns } from '../expressions/index.js'
import { sanitizeHtml } from '../utils/sanitize-html.js'

export function Sidebar() {
  const div = document.createElement('div')
  div.className = 'sidebar'
  div.innerHTML = `<h1>Dinky Dog</h1>`

  const content = document.createElement('div')
  div.appendChild(content)

  const fnNames = Object.keys(Fns)
    .map((name) => `<li>=${name}</li>`)
    .join('')

  const info = document.createElement('div')
  info.innerHTML = `
    <h2>Instructions</h2>
    <p>Click anywhere to add a node.</p>
    <p>Drag a node off screen to remove.</p>
    <p>Drag-n-drop images.</p>
    <p>Copy the URL to share.</p>
    <h2>Functions</h2>
    <p>Use these functions in the nodes:</p>
    <ul>${fnNames}</ul>
  `
  div.appendChild(info)

  const footer = document.createElement('footer')
  div.appendChild(footer)

  const toggle = new Toggle('Lock 🔒')
  footer.appendChild(toggle.container)

  return {
    container: div,

    render: ({ description, note = '', onNoteEdit, isLocked, setLocked }) => {
      content.innerHTML = sanitizeHtml(description)

      if (onNoteEdit) {
        const editableText = EditableText({ onInput: onNoteEdit })
        content.appendChild(editableText.render({ text: note }))
      }

      if (setLocked) {
        toggle.render({ checked: isLocked, onChange: setLocked })
      }

      return div
    },
  }
}
