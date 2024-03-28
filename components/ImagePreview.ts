import { Component } from '../utils/dom.js'

export function ImagePreview() {
  const component = Component({
    tag: 'iframe',

    style: {
      display: 'none',
      width: '100%',
      pointerEvents: 'none',
    },

    render: ({ src = '' }) => {
      if (!src) return

      const { container } = component
      component.container.style.display = 'block'
      container.setAttribute('sandbox', '')

      container.setAttribute(
        'src',
        'data:text/html,' +
        encodeURIComponent(
          `
           <style>* { margin: 0; padding: 0; }</style>
           <img src="${src}" style="display: block; width: 100%; height: auto;">
          `,
        ),
      )
    },
  })

  return component
}
