export function makeDroppable({ container, fileTypes, onDrop }) {
  container.addEventListener('drop', (e) => {
    e.preventDefault()

    const file = e.dataTransfer.files[0]
    if (fileTypes.test(file.type)) {
      const x = e.clientX + container.scrollLeft
      const y = e.clientY + container.scrollTop

      const reader = new FileReader()
      reader.onload = ({ target }) => {
        onDrop({ x, y, type: file.type, data: target.result })
      }
      reader.readAsDataURL(file)
    }
  })

  container.addEventListener('dragover', (e) => e.preventDefault())
}
