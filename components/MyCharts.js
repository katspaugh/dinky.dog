export function MyCharts() {
  const container = document.createElement('details')
  container.open = true

  const header = document.createElement('summary')
  header.innerText = 'My charts'
  container.appendChild(header)

  const list = document.createElement('ul')
  container.appendChild(list)

  return {
    container,

    render: ({ charts }) => {
      list.innerHTML = ''

      charts.forEach((chart) => {
        const li = document.createElement('li')
        const link = document.createElement('a')
        link.href = location.origin + '?' + chart.id + '#' + chart.hash
        link.innerText = chart.title || chart.id
        li.appendChild(link)
        list.appendChild(li)
      })

      return container
    },

    destroy: () => container.remove(),
  }
}
