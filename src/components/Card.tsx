import { useMemo } from 'react'
import { Editable } from './Editable.js'

type CardProps = {
  id: string
  width: number
  height: number
  color: string
  content: string
  onContentChange: (content: string) => void
  onHeightChange: (height: number) => void
}

export function Card(props: CardProps) {
  const sx = useMemo(() => ({ backgroundColor: props.color }), [props.color])
  return (
    <div className="Card" style={sx}>
      <Editable
        id={props.id}
        content={props.content}
        width={props.width}
        height={props.height}
        onChange={props.onContentChange}
        onHeightChange={props.onHeightChange}
      />
    </div>
  )
}
