export function ConnectorPoint(left, top) {
  const container = document.createElement('button')
  container.tabIndex = 1

  Object.assign(container.style, {
    borderRadius: '100%',
    padding: 0,
    width: '16px',
    height: '16px',
    marginLeft: '-8px',
    transform: 'translateY(-50%)',
    position: 'absolute',
    zIndex: 5,
    left,
    top,
    cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>∿</text></svg>") 0 16, pointer`,
  })

  return {
    container,

    render: () => container,

    destroy: () => container.remove(),
  }
}
