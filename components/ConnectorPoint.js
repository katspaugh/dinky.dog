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
  })

  return {
    container,

    render: () => container,

    destroy: () => container.remove(),
  }
}
