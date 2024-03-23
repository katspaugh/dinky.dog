import { Component } from '../utils/dom.js'

export function ConnectorPoint(left, top) {
  return Component({
    tag: 'button',
    props: {
      tabIndex: 1,
    },
    style: {
      borderRadius: '100%',
      padding: 0,
      width: '16px',
      height: '16px',
      marginLeft: '-8px',
      transform: 'translateY(-50%)',
      position: 'absolute',
      zIndex: 5,
      left,
      top,
    },
  })
}
