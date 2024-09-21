type ColorPickerProps ={
  color?: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#F9F9F9',
  '#ffe8ed',
  '#d6e2e7',
  '#bbeebb',
  '#fefeca',
  '#e1d8f0',
  '#ffd9a3',
  '#d9f3e6',
  '#BFE8FE',
  '#fff2d9',
]

const datalist = document.createElement('datalist')
datalist.id = 'colors'
PRESET_COLORS.forEach((color) => {
  const option = document.createElement('option')
  option.value = color
  datalist.appendChild(option)
})
document.body.appendChild(datalist)

export const ColorPicker = ({ color, onColorChange }: ColorPickerProps) => {
  return (
    <input
      className="ColorPicker"
      type="color"
      value={color || PRESET_COLORS[0]}
      onInput={(e) => onColorChange((e.target as HTMLInputElement).value)}
      list="colors"
    />
  )
}
