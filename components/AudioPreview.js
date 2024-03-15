import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'

export function AudioPreview() {
  const container = document.createElement('div')
  container.style.padding = '10px'

  const wavesurfer = WaveSurfer.create({
    container,
    waveColor: '#aaf',
    progressColor: '#77f',
    mediaControls: true,
  })

  return {
    container,
    render: ({ src }) => {
      wavesurfer.load(src)
      return container
    },
    destroy: () => {
      wavesurfer.destroy()
      container.remove()
    },
  }
}
