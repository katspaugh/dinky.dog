export function makeDroppable({ container, fileType, onDrop }) {
  container.addEventListener('drop', (e) => {
    e.preventDefault()

    const file = e.dataTransfer.files[0]
    if (file.type.startsWith(fileType)) {
      const x = e.clientX
      const y = e.clientY

      const reader = new FileReader()
      reader.onload = ({ target }) => {
        onDrop({ x, y, data: target.result })
      }
      reader.readAsDataURL(file)
    }
  })

  container.addEventListener('dragover', (e) => e.preventDefault())
}
