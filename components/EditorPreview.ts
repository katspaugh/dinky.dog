import { Component, el } from '../utils/dom.js'
import * as TextParsers from '../utils/parse-text.js'
import { ImagePreview } from '../components/ImagePreview.js'
import { AudioPreview } from '../components/AudioPreview.js'
import { LinkPreview } from '../components/LinkPreview.js'
import { Math } from '../components/Math.js'

function getPreviewContent(value) {
  const url = TextParsers.parseUrl(value)
  if (url) {
    const Component = TextParsers.parseImageUrl(value)
      ? ImagePreview
      : TextParsers.parseAudioUrl(value)
        ? AudioPreview
        : LinkPreview
    return Component().render({ src: url })
  }

  const expression = TextParsers.parseMath(value)
  if (expression) {
    return Math().render({ expression })
  }

  return null
}

export function EditorPreview(editorEl) {
  let lastPreview
  const editorContainer = el('div', { className: 'editor' }, editorEl)
  const previewContainer = el('div', { className: 'preview' })

  return Component({
    children: [editorContainer, previewContainer],

    props: {
      className: 'editor-preview',
    },

    render: ({ value = '' }) => {
      if (lastPreview) {
        previewContainer.innerHTML = ''
      }
      const preview = getPreviewContent(value)
      if (preview) {
        previewContainer.appendChild(preview)
      }
      lastPreview = preview
    },
  })
}
