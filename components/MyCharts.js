function makeListItem({ href, title, listStyleType }) {
  const li = document.createElement('li')
  const link = document.createElement('a')
  link.href = href
  link.innerText = title
  if (listStyleType) {
    li.style.listStyleType = listStyleType
  }
  li.appendChild(link)
  return li
}

export function MyCharts() {
  const container = document.createElement('details')
  container.open = true

  const header = document.createElement('summary')
  header.innerText = 'My flows'
  container.appendChild(header)

  const list = document.createElement('ul')
  container.appendChild(list)

  return {
    container,

    render: ({ charts }) => {
      list.innerHTML = ''

      const li = makeListItem({
        href: location.origin + '?#new',
        title: 'New flow',
        listStyleType: '"+"',
      })
      list.appendChild(li)

      charts.forEach((chart) => {
        const li = makeListItem({
          href: location.origin + '?' + chart.id + '#' + chart.hash,
          title: chart.title || chart.id,
        })
        list.appendChild(li)
      })

      return container
    },

    destroy: () => container.remove(),
  }
}
