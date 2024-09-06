/* Proxy-based signals implementation */

// Example usage
/*
const count = signal(0);

// Read a signal’s value by accessing .value:
console.log(count.value);   // 0

// Update a signal’s value:
count.value += 1;

// The signal's value has changed:
console.log(count.value);  // 1
 */

// Signal class
export class Signal<T> {
  private _value: T
  private _proxy: Signal<T>

  constructor(value: T) {
    this._value = value
    this._proxy = new Proxy(this, {
      get(target, prop) {
        if (prop === 'value') {
          return target._value
        }
        return Reflect.get(target, prop)
      },
      set(target, prop, value) {
        if (prop === 'value') {
          target._value = value
          return true
        }
        return Reflect.set(target, prop, value)
      },
    })
    return this._proxy
  }
}
