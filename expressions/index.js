export const Fns = {
  add: (...args) => args.map(parseFloat).reduce((a, b) => a + b, 0),

  mult: (...args) => args.map(parseFloat).reduce((a, b) => a * b, 1),

  upper: (...args) => args.map(String).join(' ').toUpperCase(),

  lower: (...args) => args.map(String).join(' ').toLowerCase(),

  embed: (url) => {
    if (!url) return ''
    return `<iframe src="${url}">`
  },
}
