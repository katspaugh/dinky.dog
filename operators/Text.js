import { Stream } from '../utils/stream.js'
import { Fns } from '../expressions/index.js'
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
      outputStream.next(String(runFn()))
    } else {
      if (!lastInput) {
        outputStream.next(typeof value === 'string' ? value : JSON.stringify(value, null, 2))
      }
    }
  })

  outputStream.next(fn ? runFn() : initialValue)

  return {
    inputs: [inputStream],

    output: outputStream,

    serialize: () => lastInput || '', // Only user input, not the result of a function

    render: () => {
      const container = component.render({ text: initialValue || '' })

      // Autofocus if there's no initial value
      if (!initialValue) {
        setTimeout(() => {
          container.focus()
        }, 100)
      }

      return container
    },

    destroy: () => {
      unsubOutput()
      unsubInput()
      component.destroy()
    },
  }
}
