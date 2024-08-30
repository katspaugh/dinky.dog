import { Component } from '../lib/component.js'
import { css, el } from '../lib/dom.js'
import { type LinkPreview, fetchPreview } from '../lib/link-preview.js'
import { sanitizeHtml } from '../lib/sanitize-html.js'
import { API_URL } from '../lib/upload-image.js'
import { parseAudioUrl, parseImageUrl, parseUrl } from '../lib/utils.js'

type EditableEvents = {
  input: { content: string }
}

type EditableProps = {
  content: string
  width?: number | null
  height?: number | null
}

const ABS_MIN_WIDTH = 100
const ABS_MIN_HEIGHT = 35

const INITIAL_WIDTH = 170
const INITIAL_HEIGHT = 73

export class Editable extends Component<EditableProps, EditableEvents> {
  private lastContent = ''
  private firstContent = true

  constructor() {
    super('div', {
      contentEditable: 'true',

      tabIndex: 1,

      style: {
        whiteSpace: 'pre-wrap',
        overflowWrap: 'normal',
        hyphens: 'auto',
        borderRadius: '4px',
        padding: '8px',
        paddingRight: '20px',
        minWidth: `${ABS_MIN_WIDTH}px`,
        minHeight: `${ABS_MIN_HEIGHT}px`,
        maxWidth: '260px',
        maxHeight: '260px',
        overflowY: 'auto',
        fontFamily: `'Lucida Grande', Helvetica, Arial, sans-serif`,
      },

      oninput: () => {
        this.lastContent = this.container.innerHTML
        this.emit('input', { content: this.lastContent })
      },

      onblur: () => {
        const html = this.container.innerHTML
        const content = sanitizeHtml(html)
        this.emit('input', { content })

        if (content) {
          this.resetMinSize()
        }

        const url = parseUrl(html)
        if (url) {
          let content = url
          if (parseImageUrl(url)) {
            content = this.getPreviewImg(url)
          } else if (parseAudioUrl(url)) {
            content = this.getPreviewAudio(url)
          } else {
            content = this.getPreviewLink(url)

            // Load preview and replace content
            this.loadPreview(url).then((data) => {
              if (data) {
                const content = this.getPreviewContent(data)
                this.emit('input', { content })
              }
            })
          }
          this.emit('input', { content })
        }
      },

      onkeydown: (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          this.container.blur()
        }
      },

      onclick: (e: MouseEvent) => {
        if (e.target instanceof HTMLAnchorElement) {
          e.preventDefault()
          window.open(e.target.href, '_blank')
        } else if (e.target instanceof HTMLAudioElement) {
          e.stopPropagation()
        }
      },
    })

    css(this.container, {
      width: `${INITIAL_WIDTH}px`,
      minHeight: `${INITIAL_HEIGHT}px`,
    })
  }

  private async loadPreview(url: string) {
    try {
      const data = await fetchPreview(url)
      return data
    } catch (error) {
      console.error('Failed to fetch preview for', url, error)
      return null
    }
  }

  private getPreviewImg(src: string) {
    const crossOrigin = src.startsWith(API_URL) ? undefined : 'anonymous'
    return el('img', { src, alt: 'preview', crossOrigin }).outerHTML
  }

  private getPreviewLink(url: string, text?: string) {
    return el('a', { href: url, textContent: text || url, target: '_blank' }).outerHTML
  }

  private getPreviewText(text: string) {
    return el('p', { textContent: text }).outerHTML
  }

  private getPreviewAudio(src: string) {
    return el('audio', { src, crossOrigin: 'anonymous', controls: true }).outerHTML
  }

  private getPreviewContent(data: LinkPreview) {
    const domain = new URL(data.url).hostname
    const img = data.image ? this.getPreviewImg(data.image) : ''
    const title = this.getPreviewLink(data.url, data.title)
    const description = this.getPreviewText(data.description ?? '')
    const source = this.getPreviewLink(data.url, domain)
    return `${img}${title}${description}${source}`
  }

  private resetMinSize() {
    if (this.firstContent) {
      this.firstContent = false
      css(this.container, {
        minHeight: '',
      })
    }
  }

  render() {
    const { content, width, height } = this.props

    if (content !== this.lastContent) {
      this.lastContent = content
      this.container.innerHTML = sanitizeHtml(content ?? '')

      if (content) {
        this.resetMinSize()
      }
    }

    if (width !== undefined) {
      const reset = width === null
      css(this.container, {
        width: reset ? '' : `${width}px`,
        minWidth: '',
        maxWidth: reset ? '' : 'none',
      })
    }

    if (height !== undefined) {
      const reset = height === null
      css(this.container, {
        height: reset ? '' : `${height}px`,
        minHeight: '',
        maxHeight: reset ? '' : 'none',
      })
    }
  }

  getSize() {
    return {
      width: this.container.offsetWidth,
      height: this.container.offsetHeight,
    }
  }

  focus() {
    this.container.focus()
  }

  blur() {
    this.container.blur()
  }
}
