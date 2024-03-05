const API_URL = 'https://tinyurl.com/dinky-etherscan-api'

export async function fetchBalance(address) {
  const res = await fetch(`${API_URL}?&module=account&action=balancemulti&address=${address}&tag=latest`)
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }
  const data = await res.json()
  if (data.message !== 'OK') {
    throw new Error(`API error! Message: ${data.message}`)
  }

  return data.result[0]
}
