import { Stream } from '../utils/stream.js'
import { EditableText } from '../components/EditableText.js'
import * as TextTransformers from '../text-transformers/index.js'
import { ImagePreview } from '../components/ImagePreview.js'
import { AudioPreview } from '../components/AudioPreview.js'
import { LinkPreview } from '../components/LinkPreview.js'
import { Math } from '../components/Math.js'

const Preview = () => {
  const container = document.createElement('div')
  Object.assign(container.style, {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    borderRadius: 'inherit',
    display: 'flex',
    flexDirection: 'column',
  })
  const editorContainer = document.createElement('div')
  const previewContainer = document.createElement('div')
  previewContainer.className = 'preview'
  container.appendChild(editorContainer)
  container.appendChild(previewContainer)

  return {
    container,

    render: ({ editor = null, preview = null }) => {
      if (editor) {
        editorContainer.innerHTML = ''
        editorContainer.appendChild(editor)
      }
      previewContainer.innerHTML = ''
      if (preview) {
        previewContainer.appendChild(preview)
      }
      return container
    },

    destroy: () => {
      container.remove()
    },
  }
}

function getPreviewContent(value) {
  const url = TextTransformers.parseUrl(value)
  if (url) {
    const Component = TextTransformers.parseImageUrl(value)
      ? ImagePreview
      : TextTransformers.parseAudioUrl(value)
        ? AudioPreview
        : LinkPreview
    return Component().render({ src: url })
  }

  const expression = TextTransformers.parseMath(value)
  if (expression) {
    console.log('expression', expression)
    return Math().render({ expression })
  }
}

export function Text(initialValue) {
  let lastInput = ''
  const inputStream = new Stream()
  const outputStream = new Stream()

  const onInput = (value) => {
    outputStream.next(value)
  }

  const preview = Preview()
  const editor = EditableText({ onInput })
  preview.render({ editor: editor.container })

  // Mirror output in the UI
  outputStream.subscribe((value) => {
    if (value !== lastInput) {
      lastInput = value
      editor.render({ text: value })

      const previewContent = getPreviewContent(value)
      if (previewContent) {
        preview.render({ preview: previewContent })
      }
    }
  })

  if (initialValue) {
    outputStream.next(initialValue)
  }

  return {
    input: inputStream,

    output: outputStream,

    serialize: () => outputStream.get(),

    render: ({ focus = false } = {}) => {
      editor.render({ text: outputStream.get() })

      // Focus the input if requested
      if (focus) {
        editor.container.focus()
      }

      return preview.container
    },

    destroy: () => {
      inputStream.destroy()
      outputStream.destroy()
      editor.destroy()
      preview.destroy()
    },
  }
}
