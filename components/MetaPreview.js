import { Component, el } from '../utils/dom.js'
import { ImagePreview } from './ImagePreview.js'

export function MetaPreview() {
  const imagePreview = ImagePreview()

  const titleEl = el('a', {
    target: '_blank',
    style: {
      display: 'block',
      margin: '10px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  })

  return Component({
    children: [titleEl, imagePreview.container],

    style: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },

    render: ({ url, title = url, image }) => {
      titleEl.innerText = title
      titleEl.href = url

      if (image) {
        imagePreview.render({ src: image })
      }
    },
  })
}
