import { useEffect, useRef } from 'react'
import { draggable } from '../lib/draggable.js'

type ResizerProps = {
  onResize: (width: number, height: number) => void
}

export function Resizer({ onResize }: ResizerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    return draggable(ref.current, onResize)
  }, [ref, onResize])

  return <div className="Resizer" ref={ref} />
}
