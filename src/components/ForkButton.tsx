import { useCallback } from 'react'

type ForkButtonProps = {
  onFork: () => void
}

export const ForkButton = ({ onFork }: ForkButtonProps) => {
  const onClick = useCallback(() => {
    onFork()
  }, [onFork])

  return (
    <button className="ForkButton" onClick={onClick}>
      Fork
    </button>
  )
}
