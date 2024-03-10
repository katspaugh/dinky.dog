export function ImagePreview() {
  const iframe = document.createElement('iframe')
  iframe.style.width = '100%'
  iframe.setAttribute('sandbox', '')
  iframe.style.pointerEvents = 'none'

  return {
    container: iframe,

    render: ({ src }) => {
      iframe.src =
        'data:text/html,' +
        encodeURIComponent(
          `
           <style>* { margin: 0; padding: 0; }</style>
           <img src="${src}" style="display: block; width: 100%; height: auto;">
          `,
        )
      return iframe
    },

    destroy: () => iframe.remove(),
  }
}
