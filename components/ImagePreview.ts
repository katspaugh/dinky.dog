import { Component, el } from '../utils/dom.js'
import { API_URL as IMAGE_API_URL } from '../services/images.js'

export function ImagePreview({ className = '' } = {}) {
  const component = Component({
    props: {
      className: 'image-preview' + (className ? ' ' + className : ''),
    },

    style: {
      display: 'none',
    },

    render: ({ src = '' }) => {
      const { container } = component

      if (!src) {
        container.innerHTML = ''
        container.style.display = 'none'
        return
      }

      if (src.startsWith(IMAGE_API_URL)) {
        container.innerHTML = `<img src="${src}" />`
      } else {
        const iframeContent = encodeURIComponent(
          `<style>* { margin: 0; padding: 0; }</style><img src="${src}" style="display: block; width: 100%; height: auto;" />`,
        )
        container.innerHTML = `<iframe sandbox="" src="data:text/html,${iframeContent}" />`
      }

      container.style.display = 'block'
    },
  })

  return component
}
