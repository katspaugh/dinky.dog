import { Component } from '../utils/dom.js'

export function ImagePreview() {
  const component = Component({
    tag: 'iframe',

    style: {
      display: 'none',
      width: '100%',
      pointerEvents: 'none',
    },

    props: {
      sandbox: '',
    },

    render: ({ src }) => {
      component.container.style.display = 'block'

      component.container.src =
        'data:text/html,' +
        encodeURIComponent(
          `
           <style>* { margin: 0; padding: 0; }</style>
           <img src="${src}" style="display: block; width: 100%; height: auto;">
          `,
        )
    },
  })

  return component
}
