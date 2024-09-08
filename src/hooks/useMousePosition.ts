import { useEffect, useState } from 'https://esm.sh/preact/hooks'

export function useMousePosition() {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    const onMouseMove = (e) => {
      const scrollX = document.body.scrollLeft
      const scrollY = document.body.scrollTop
      setMousePos({ x: e.clientX + scrollX, y: e.clientY + scrollY })
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return mousePos
}
