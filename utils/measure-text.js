let dummyDiv = null

const MAX_WIDTH = 200

export function measureText(text, width, height) {
  if (!dummyDiv) {
    dummyDiv = document.createElement('div')
    dummyDiv.style.padding = '10px'
    dummyDiv.style.position = 'absolute'
    dummyDiv.style.top = '-9999px'
    dummyDiv.style.left = '-9999px'
    dummyDiv.style.pointerEvents = 'none'
    dummyDiv.style.visibility = 'hidden'
    document.body.appendChild(dummyDiv)
  }

  dummyDiv.style.width = width + 'px'
  dummyDiv.innerText = text

  if (dummyDiv.clientHeight > height) {
    dummyDiv.style.width = Math.max(MAX_WIDTH, width) + 'px'
  }

  return {
    width: dummyDiv.clientWidth,
    height: dummyDiv.clientHeight,
  }
}
