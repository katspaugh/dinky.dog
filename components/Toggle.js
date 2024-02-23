export function Toggle(label = '') {
  const container = document.createElement('label')
  container.innerText = label
  Object.assign(container.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    userSelect: 'none',
    cursor: 'pointer',
  })

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  container.prepend(checkbox)

  return {
    container,

    render: ({ checked, onChange }) => {
      checkbox.checked = checked
      checkbox.onchange = () => {
        onChange(checkbox.checked)
      }
      return container
    },
  }
}
