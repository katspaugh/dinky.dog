import { Stream } from '../stream.js'
import { Fns } from '../fns/index.js'
import { EditableText } from '../components/EditableText.js'

const getFn = (value) => {
  if (typeof value !== 'string') return null
  if (!value.startsWith('=')) return null
  const fnName = value.slice(1)
  return Fns[fnName]
}

export function Text(initialValue) {
  const inputStream = new Stream()
  const outputStream = new Stream()

  let lastInput = initialValue
  let fn = getFn(initialValue)
  const combinedInputs = {}

  const runFn = () => {
    const args = Object.values(combinedInputs)
    return fn(...args)
  }

  const onInput = (value) => {
    lastInput = value
    fn = getFn(value)
    outputStream.next(fn ? runFn() : value)
  }

  const component = EditableText({ onInput })

  // Mirror output in the UI
  const unsubOutput = outputStream.subscribe((value) => {
    if (!fn) {
      component.render({ text: value })
    }
  })

  const unsubInput = inputStream.subscribe((value, from) => {
    if (fn) {
      combinedInputs[from] = value
      if (value === undefined) {
        delete combinedInputs[from]
      }
      outputStream.next(runFn())
    } else {
      if (!lastInput) {
        outputStream.next(value)
      }
    }
  })

  outputStream.next(fn ? runFn() : initialValue)

  return {
    inputs: [inputStream],

    output: outputStream,

    serialize: () => {
      return lastInput || ''
    },

    render: () => {
      return component.render({ text: initialValue || '' })
    },

    destroy: () => {
      unsubOutput()
      unsubInput()
    },
  }
}
