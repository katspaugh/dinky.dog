import { Stream } from '../utils/stream.js'
import { parseEthAddress } from '../text-transformers/index.js'
import { debounce } from '../utils/debounce.js'
import { fetchBalance } from '../services/etherscan.js'

function PreviewComponent() {
  const container = document.createElement('div')
  const addressEl = document.createElement('div')
  const balanceEl = document.createElement('div')
  container.innerHTML = '<b>Ethereum account</b>'
  container.appendChild(addressEl)
  container.appendChild(balanceEl)

  Object.assign(container.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '10px',
  })

  return {
    container,

    render: ({ account, balance }) => {
      addressEl.textContent = account.slice(0, 6) + '…' + account.slice(-4)
      balanceEl.textContent = (balance / 1e18).toFixed(6) + ' ETH'
    },
    destroy: () => {
      container.remove()
    },
  }
}

export function EthPreview(text = '') {
  let lastAddress = ''
  const inputStream = new Stream(text)
  const outputStream = new Stream()
  const component = PreviewComponent()

  const onChange = debounce((address) => {
    if (!address) return

    fetchBalance(address)
      .catch(() => ({ account: address, balance: 0 }))
      .then((data) => {
        if (address === lastAddress) {
          outputStream.next(data)
        }
      })
  }, 100)

  inputStream.subscribe((value) => {
    const address = parseEthAddress(value)
    lastAddress = address
    onChange(address)
  })

  outputStream.subscribe((data) => {
    component.render(data)
  })

  const operator = {
    input: inputStream,

    output: outputStream,

    serialize: () => lastAddress,

    render: () => component.container,

    destroy: () => {
      inputStream.destroy()
      outputStream.destroy()
      component.destroy()
    },
  }

  return operator
}
