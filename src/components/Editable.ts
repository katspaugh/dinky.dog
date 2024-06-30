import { Component } from '../lib/component.js'
import { css, el } from '../lib/dom.js'
import { type LinkPreview, fetchPreview } from '../lib/link-preview.js'
import { sanitizeHtml } from '../lib/sanitize-html.js'
import { parseImageUrl, parseUrl } from '../lib/utils.js'

type EditableEvents = {
  input: { content: string }
}

type EditableProps = {
  content: string
  width?: number | null
  height?: number | null
}

const ABS_MIN_WIDTH = 70
const ABS_MIN_HEIGHT = 37

export class Editable extends Component<EditableProps, EditableEvents> {
  private lastContent = ''

  constructor() {
    super('div', {
      contentEditable: 'true',

      style: {
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        borderRadius: '4px',
        border: '1px solid #333',
        padding: '8px',
        paddingRight: '20px',
        minWidth: '160px',
        minHeight: '70px',
        maxWidth: '300px',
        maxHeight: '300px',
        overflowY: 'auto',
        fontFamily: 'sans-serif',
      },

      oninput: () => {
        this.updateContent(this.container.innerHTML)
      },

      onblur: () => {
        let content = this.container.innerHTML

        const url = parseUrl(content)
        if (url) {
          if (parseImageUrl(url)) {
            content = this.getPreviewImg(url)
          } else {
            content = this.getPreviewLink(url)

            // Load preview and replace content
            this.loadPreview(url).then((data) => {
              if (data) {
                this.emit('input', { content: this.getPreviewContent(data) })
              }
            })
          }
        }
        this.updateContent(sanitizeHtml(content))
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
        }
      },
    })
  }

  private updateContent(content: string) {
    if (content !== this.props.content) {
      this.lastContent = content
      this.emit('input', { content })
    }
  }

  private async loadPreview(url: string) {
    try {
      const data = await fetchPreview(url)
      console.log('Link preview', data)
      return data
    } catch (error) {
      console.error('Failed to fetch preview for', url, error)
      return null
    }
  }

  private getPreviewImg(src: string) {
    return el('img', { src, alt: 'preview', crossOrigin: 'anonymous' }).outerHTML
  }

  private getPreviewLink(url: string, text?: string) {
    return el('a', { href: url, textContent: text || url, target: '_blank' }).outerHTML
  }

  private getPreviewText(text?: string) {
    return text ? el('p', { textContent: text }).outerHTML : ''
  }

  private getPreviewContent(data: LinkPreview) {
    const domain = new URL(data.url).hostname
    const img = data.image ? this.getPreviewImg(data.image) : ''
    const title = this.getPreviewLink(data.url, data.title)
    const description = this.getPreviewText(data.description)
    const source = this.getPreviewLink(data.url, domain)
    return `${img}${title}${description}${source}`
  }

  render() {
    const { content, width, height } = this.props

    if (content !== this.lastContent) {
      this.lastContent = content
      this.container.innerHTML = sanitizeHtml(content ?? '')
    }

    if (width !== undefined) {
      const reset = width === null
      css(this.container, {
        width: reset ? '' : `${width}px`,
        maxWidth: 'none',
        minWidth: `${ABS_MIN_WIDTH}px`,
      })
    }

    if (height !== undefined) {
      const reset = height === null
      css(this.container, {
        height: reset ? '' : `${height}px`,
        maxHeight: 'none',
        minHeight: `${ABS_MIN_HEIGHT}px`,
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
