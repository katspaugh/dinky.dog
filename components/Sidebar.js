export function Sidebar() {
  const div = document.createElement('div')
  div.className = 'sidebar'
  div.innerHTML = `<h1>Dinky Dog</h1>`

  const content = document.createElement('div')
  content.innerHTML = `<h4>Shareable flow charts</h4><p>Click anywhere to add a node.</p><p>Drag a node off screen to remove.</p><p>Drag-n-drop images.</p><p>Copy the URL to share.</p>`
  div.appendChild(content)

  return {
    container: div,

    render: ({ description }) => {
      content.innerHTML = ''
      content.appendChild(description)
    },
  }
}
