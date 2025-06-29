import { Editor } from '../components/Editor.js'
import { DocumentProvider } from '../context/DocumentContext.js'

export function EditorPage() {
  return (
    <DocumentProvider>
      <Editor />
    </DocumentProvider>
  )
}
