import { Component, el } from '../utils/dom.js'
import { API_URL as IMAGE_API_URL } from '../services/images.js'

export function ImagePreview() {
  const component = Component({
    props: {
      className: 'image-preview',
    },

    render: ({ src = '' }) => {
      const { container } = component

      if (!src) {
        container.innerHTML = ''
        return
      }

      if (src.startsWith(IMAGE_API_URL) || src.startsWith('data:')) {
        const img = el('img', { src })
        img.onload = () => {
          container.innerHTML = ''
          container.appendChild(img)
        }
        img.onerror = () => {
          container.innerHTML = ''
        }
      } else {
        const iframeContent = encodeURIComponent(
          `<style>* { margin: 0; padding: 0; }</style><img src="${src}" style="display: block; width: 100%; height: auto;" />`,
        )
        container.innerHTML = `<iframe sandbox="" src="data:text/html,${iframeContent}" />`
      }
    },
  })

  return component
}
