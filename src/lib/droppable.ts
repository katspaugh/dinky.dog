const DRAGOVER_CLASS = 'dragover'

export function makeDroppable({
  container,
  fileTypes,
  onDrop,
}: {
  container: HTMLElement
  fileTypes: RegExp
  onDrop: ({ x, y, file }: { x: number; y: number; file: File }) => void
}) {
  container.addEventListener('drop', (e) => {
    e.preventDefault()

    container.classList.remove(DRAGOVER_CLASS)

    const file = e.dataTransfer?.files[0]
    if (file && fileTypes.test(file.type)) {
      const x = e.clientX
      const y = e.clientY
      onDrop({ x, y, file })
    }
  })

  container.addEventListener('dragover', (e) => {
    e.preventDefault()
    container.classList.add(DRAGOVER_CLASS)
  })

  container.addEventListener('dragleave', () => {
    container.classList.remove(DRAGOVER_CLASS)
  })
}
