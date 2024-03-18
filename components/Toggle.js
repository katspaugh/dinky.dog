import { Component, el } from '../utils/dom.js'

export function Toggle(label = '') {
  const checkbox = el('input', { type: 'checkbox' })

  return Component({
    tag: 'label',
    props: {
      innerText: label,
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      userSelect: 'none',
    },

    children: [checkbox, label],

    render: ({ checked, onChange }) => {
      if (checked != null) {
        checkbox.checked = checked
      }
      checkbox.onchange = () => {
        onChange(checkbox.checked)
      }
      if (!onChange) {
        checkbox.disabled = true
      }
    },
  })
}
