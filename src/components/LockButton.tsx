import { useCallback } from 'preact/hooks'

type LockButtonProps = {
  isLocked: boolean
  onLockChange: (isLocked: boolean) => void
}

export const LockButton = ({ isLocked, onLockChange }: LockButtonProps) => {
  const onClick = useCallback(() => {
    onLockChange(!isLocked)
  }, [isLocked, onLockChange])

  return <button className="LockButton" onClick={onClick}>
    {isLocked ? '🔒' : '🔓'} {isLocked ? 'Unlock' : 'Lock'}
  </button>
}
