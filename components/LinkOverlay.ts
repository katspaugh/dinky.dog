import { Component } from '../utils/dom.js'

const URLS_REGEXP = /(^|[^>"'])(https?:\/\/[-a-z0-9._]+\.[a-z]{2,}(\/[-a-z0-9._?=&%]+)*)(?=[^<"']|$)/gi

function linkify(html = '') {
  return html.replace(URLS_REGEXP, (_, before, url) => {
    return `${before}<a href="${url}" target="_blank">${url}</a>`
  })
}

export function LinkOverlay() {
  const component = Component({
    props: {
      className: 'link-overlay',

      contentEditable: 'false',

      styles: {
        display: 'none',
      },
    },

    render: ({ html }) => {
      if (html) {
        component.container.innerHTML = linkify(html)
      }
      component.container.style.display = html ? 'block' : 'none'
    },
  })

  return component
}
