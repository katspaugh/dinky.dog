import { useCallback, useEffect, useMemo, useRef, useState } from 'https://esm.sh/preact/hooks'
import { html } from 'https://esm.sh/htm/preact'
import { sanitizeHtml } from '../lib/sanitize-html.js'
import { parseUrl } from '../lib/utils.js'
import { fetchPreview, type LinkPreview } from '../lib/link-preview.js'
import { API_URL } from '../lib/upload-image.js'

type EditableProps = {
  id: string
  content: string
  width?: number
  height?: number
  onChange: (content: string) => void
  onHeightChange: (height: number) => void
}

export const INITIAL_WIDTH = 150
export const INITIAL_HEIGHT = 70

const getPreviewHtml = (preview: LinkPreview) => {
  const domain = new URL(preview.url).hostname
  const crossOrigin = preview.image?.startsWith(API_URL) ? '' : 'anonymous'
  return sanitizeHtml([
    `<img src=${preview.image} crossorigin=${crossOrigin} />`,
    `<h4>${preview.title}</h4>`,
    `<a href=${preview.url} target="_blank" nofollow noopener>${domain}</a>`,
  ].join(''))
}

export const Editable = ({ id, content, width, height, onChange, onHeightChange }: EditableProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isManualHeight = height && height === Math.round(height)
  const [hasMinHeight, setHasMinHeight] = useState(!content && !isManualHeight)

  const updateHeight = useCallback(() => {
    if (!isManualHeight && ref.current) {
      onHeightChange(ref.current.offsetHeight + 0.01)
    }
  }, [onHeightChange, isManualHeight])

  const onBlur = useCallback((e) => {
    const { innerHTML = '' } = e.target
    const newContent = sanitizeHtml(innerHTML)
    onChange(newContent)
    if (newContent) {
      setHasMinHeight(false)
    }
    const timeout = setTimeout(updateHeight, 100)
    return () => clearTimeout(timeout)
  }, [ref, onChange, updateHeight])

  const allowLinkClick = useCallback((e) => {
    if (e.target instanceof HTMLAnchorElement) {
      e.preventDefault()
      window.open(e.target.href, '_blank')
    }
  }, [])

  const htmlContent = useMemo(() => ({ __html: sanitizeHtml(content) }), [content])

  useEffect(() => {
    if (content) {
      const url = parseUrl(content)
      if (url) {
        fetchPreview(url).then((preview) => {
          onChange(getPreviewHtml(preview))
        })
      }
    }
  }, [content, onChange])

  useEffect(updateHeight, [updateHeight])

  return html`<div
    ref=${ref}
    id=${id}
    class="Editable"
    contenteditable
    dangerouslySetInnerHTML=${htmlContent}
    onInput=${updateHeight}
    onBlur=${onBlur}
    onClick=${allowLinkClick}
    style="
      width: ${width || INITIAL_WIDTH}px;
      height: ${isManualHeight ? height + 'px' : undefined};
      min-height: ${!isManualHeight && hasMinHeight ? INITIAL_HEIGHT + 'px' : undefined};
    "
  />`
}
