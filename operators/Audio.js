import { Stream } from '../utils/stream.js'
import { parseAudioUrl } from '../text-transformers/index.js'
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'

const AudioPlayer = () => {
  const container = document.createElement('div')

  const wavesurfer = WaveSurfer.create({
    container,
    waveColor: '#aaf',
    progressColor: '#77f',
    mediaControls: true,
  })

  wavesurfer.on('click', () => wavesurfer.playPause())

  return {
    container,
    render: ({ src }) => {
      wavesurfer.load(src)
    },
    destroy: () => {
      wavesurfer.destroy()
      container.remove()
    },
  }
}

export function Audio(text = '') {
  const inputStream = new Stream()
  const outputStream = new Stream(text)
  const component = AudioPlayer()

  inputStream.subscribe((text) => {
    const url = parseAudioUrl(text)
    if (url) {
      outputStream.next(url)
    }
  })

  outputStream.subscribe((src) => {
    component.render({ src })
  })

  return {
    input: inputStream,

    output: outputStream,

    serialize: () => outputStream.get().toString(),

    render: () => component.container,

    destroy: () => {
      inputStream.destroy()
      outputStream.destroy()
      component.destroy()
    },
  }
}
