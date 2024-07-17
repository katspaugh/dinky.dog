import { Component } from '../lib/component.js'

type PeerProps = {
  name: string
  emoji: string
}

class Peer extends Component<PeerProps, {}> {
  constructor() {
    super('div', {
      style: {
        borderRadius: '100%',
        fontSize: '20px',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        pointerEvents: 'all',
        cursor: 'default',
      },
    })
  }

  render() {
    this.container.textContent = this.props.emoji
    this.container.title = this.props.name
  }
}

export type PeerListProps = {
  peers: PeerProps[]
}

export class PeerList extends Component<PeerListProps, {}> {
  private peers: Peer[] = []

  private destroyPeers() {
    this.peers.forEach((peer) => {
      peer.destroy()
    })
    this.peers = []
  }

  constructor() {
    super('div', {
      style: {
        display: 'flex',
        position: 'fixed',
        left: '10px',
        top: '10px',
        zIndex: '30',
      },
    })

    this.on('destroy', () => {
      this.destroyPeers()
    })
  }

  render() {
    this.destroyPeers()

    this.props.peers.forEach((peer) => {
      const p = new Peer()
      p.setProps(peer)
      this.container.appendChild(p.container)
      this.peers.push(p)
    })
  }
}
