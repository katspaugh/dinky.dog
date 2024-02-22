import { EditableText } from '../components/EditableText.js'
import { Fns } from '../fns/index.js'

const functionNames = Object.keys(Fns)
  .map((name) => `<li>=${name}</li>`)
  .join('')

const DEFAULT_CONTENT = `<h4>Shareable flow charts</h4><p>Click anywhere to add a node.</p><p>Drag a node off screen to remove.</p><p>Drag-n-drop images.</p><p>Copy the URL to share.</p><h2>Functions</h2><ul>${functionNames}</ul>`

export function Sidebar() {
  const div = document.createElement('div')
  div.className = 'sidebar'
  div.innerHTML = `<h1>Dinky Dog</h1>`

  const content = document.createElement('div')
  content.innerHTML = DEFAULT_CONTENT
  div.appendChild(content)

  return {
    container: div,

    render: ({ description = '', note = '', onNoteEdit }) => {
      content.innerHTML = ''
      content.innerText = description

      const editableText = EditableText({ onInput: onNoteEdit })
      content.appendChild(editableText.render({ text: note }))
    },
  }
}
