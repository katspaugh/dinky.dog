import { getScrollOffset } from './scroll-offset.js'

const DRAGOVER_CLASS = 'dragover'

export function makeDroppable({
  container,
  fileTypes,
  onDrop,
}: {
  container: HTMLElement
  fileTypes: RegExp
  onDrop: (data: { x: number; y: number; type: string; data: string }) => void
}) {
  container.addEventListener('drop', (e) => {
    e.preventDefault()

    container.classList.remove(DRAGOVER_CLASS)

    const file = e.dataTransfer?.files[0]
    if (file && fileTypes.test(file.type)) {
      const { offsetX, offsetY } = getScrollOffset()
      const x = e.clientX + offsetX
      const y = e.clientY + offsetY

      const reader = new FileReader()
      reader.onload = (e) => {
        onDrop({ x, y, type: file.type, data: String(e.target?.result) })
      }
      reader.readAsDataURL(file)
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
