export function Toggle(label = '') {
  const container = document.createElement('label')
  container.innerText = label
  Object.assign(container.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    userSelect: 'none',
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
      if (!onChange) {
        checkbox.disabled = true
      }
      return container
    },

    destroy: () => container.remove(),
  }
}
