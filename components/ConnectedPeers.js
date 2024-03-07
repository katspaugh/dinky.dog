export function ConnectedPeers() {
  const container = document.createElement('div')

  Object.assign(container.style, {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '10px',
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
