export function ConnectedPeers() {
  const container = document.createElement('div')

  Object.assign(container.style, {
    position: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    top: '10px',
    right: '10px',
    zIndex: '100',
    opacity: 0.7,
  })

  return {
    container,

    render: ({ peer } = {}) => {
      if (peer) {
        container.appendChild(peer)
      }

      return container
    },

    destroy: () => {
      container.remove()
    },
  }
}
