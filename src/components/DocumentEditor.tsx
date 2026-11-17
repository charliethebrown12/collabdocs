import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { EditorToolbar } from './EditorToolbar'

type Props = {
  content: unknown
  editable: boolean
  onChange: (json: unknown) => void
}

export function DocumentEditor({ content, editable, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
    ],
    content: content as object,
    editable,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose-editor',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(editable)
  }, [editor, editable])

  useEffect(() => {
    if (!editor || content == null) return
    const current = JSON.stringify(editor.getJSON())
    const next = JSON.stringify(content)
    if (current !== next) {
      editor.commands.setContent(content as object, { emitUpdate: false })
    }
  }, [editor, content])

  return (
    <div className={`editor-shell${editable ? '' : ' is-readonly'}`}>
      <EditorToolbar editor={editor} disabled={!editable} />
      <EditorContent editor={editor} />
      {!editable && (
        <p className="readonly-hint">Read-only access — you cannot edit this document.</p>
      )}
    </div>
  )
}
