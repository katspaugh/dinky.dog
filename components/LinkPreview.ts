import { MetaPreview } from './MetaPreview.js'
import { fetchPreview } from '../services/link-preview.js'

export function LinkPreview() {
  let destroyed = false
  const metaPreview = MetaPreview()
  metaPreview.container.style.maxWidth = '300px'

  return {
    ...metaPreview,

    render: ({ src }) => {
      fetchPreview(src)
        .then((data) => {
          if (!destroyed) {
            metaPreview.render(data)
          }
        })
        .catch((e) => {
          console.error('Failed to fetch link preview', e)
          metaPreview.destroy()
        })

      return metaPreview.container
    },

    destroy: () => {
      destroyed = true
      metaPreview.destroy()
    },
  }
}
