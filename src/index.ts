import { render } from 'https://esm.sh/preact'
import { html } from './lib/html.js'
import { App } from './components/App.js'

render(html`<${App} />`, document.body)
