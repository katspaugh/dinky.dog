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
  }

  disconnect(stream: Stream) {
    this._listeners = this._listeners.filter((s) => s !== stream)
  }

  filter(fn: (value: any) => boolean): Stream {
    const stream = new Stream()
    this.subscribe((value, from) => {
      if (fn(value)) {
        stream.next(value, from)
      }
    })
    return stream
  }

  map(fn: (value: any) => any): Stream {
    const stream = new Stream()
    this.subscribe((value, from) => {
      stream.next(fn(value), from)
    })
    return stream
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
