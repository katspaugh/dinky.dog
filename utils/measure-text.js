import { EditableText } from '../components/EditableText.js'

let dummyDiv = null

const LARGE_WIDTH = 200
const MAX_WIDTH = 420

export function measureText(text, width, height) {
  if (!dummyDiv) {
    const editableText = EditableText()
    dummyDiv = editableText.container
    dummyDiv.style.position = 'absolute'
    dummyDiv.style.top = '-9999px'
    dummyDiv.style.left = '-9999px'
    dummyDiv.style.pointerEvents = 'none'
    dummyDiv.style.visibility = 'hidden'
    document.body.appendChild(dummyDiv)
  }

  dummyDiv.style.width = width + 'px'
  dummyDiv.innerHTML = text

  if (dummyDiv.clientWidth < dummyDiv.scrollWidth) {
    dummyDiv.style.width = Math.min(MAX_WIDTH, dummyDiv.scrollWidth) + 'px'
  }

  if (dummyDiv.clientHeight >= height * 1.5) {
    dummyDiv.style.width = Math.min(MAX_WIDTH, Math.max(LARGE_WIDTH, width)) + 'px'
  }

  return {
    width: dummyDiv.clientWidth,
    height: dummyDiv.clientHeight,
  }
}
