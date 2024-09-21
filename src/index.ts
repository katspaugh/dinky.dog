import { render } from 'https://esm.sh/preact'
import { html } from 'https://esm.sh/htm/preact'
import { App } from './components/App.js'

render(html`<${App} />`, document.body)
