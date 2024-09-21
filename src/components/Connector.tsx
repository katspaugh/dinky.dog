import { useCallback } from 'preact/hooks'

type ConnectorProps = {
  onClick: () => void
}

export const Connector = ({ onClick }: ConnectorProps) => {
  const onButtonClick = useCallback(
    (e) => {
      e.stopPropagation()
      e.preventDefault()
      onClick()
    },
    [onClick],
  )
  return <button className="Connector" onClick={onButtonClick} />
}
