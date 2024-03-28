export class Stream {
  private _id: string
  private _lastValue: any
  private _listeners: Stream[]

  constructor(initialValue = undefined) {
    this._id = Math.random().toString(36).slice(2)
    this._lastValue = initialValue
    this._listeners = []
  }

  connect(stream: Stream) {
    this._listeners.push(stream)

    Promise.resolve().then(() => {
      stream.next(this._lastValue, this._id)
    })
  }

  disconnect(stream: Stream) {
    this._listeners = this._listeners.filter((s) => s !== stream)

    Promise.resolve().then(() => {
      stream.next(undefined, this._id)
    })
  }

  next(value: any, from = this._id) {
    this._lastValue = value
    this._listeners.forEach((s) => s.next(value, from))
  }

  get() {
    return this._lastValue
  }

  subscribe(fn: (value: any, from: string) => void) {
    const listener = new Stream()
    listener.next = fn
    this._listeners.push(listener)
    return () => {
      this._listeners = this._listeners.filter((s) => s !== listener)
    }
  }

  destroy() {
    this._listeners = []
  }
}
