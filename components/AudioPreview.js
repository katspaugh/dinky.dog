import { Component } from '../utils/dom.js'
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'

export function AudioPreview() {
  const component = Component({
    render: ({ src }) => {
      wavesurfer.load(src)
    },
    destroy: () => {
      wavesurfer.destroy()
    },
    style: {
      padding: '10px',
    },
  })

  const wavesurfer = WaveSurfer.create({
    container: component.container,
    waveColor: '#aaf',
    progressColor: '#77f',
    mediaControls: true,
  })

  return component
}
