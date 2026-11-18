import type { Editor } from '@tiptap/react'

type Props = {
  editor: Editor | null
  disabled?: boolean
}

export function EditorToolbar({ editor, disabled }: Props) {
  if (!editor) return null

  const btn = (
    label: string,
    active: boolean,
    onClick: () => void,
  ) => (
    <button
      type="button"
      className={`toolbar-btn${active ? ' is-active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
    >
      {label}
    </button>
  )

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting">
      {btn('Bold', editor.isActive('bold'), () =>
        editor.chain().focus().toggleBold().run(),
      )}
      {btn('Italic', editor.isActive('italic'), () =>
        editor.chain().focus().toggleItalic().run(),
      )}
      {btn('Underline', editor.isActive('underline'), () =>
        editor.chain().focus().toggleUnderline().run(),
      )}
      <span className="toolbar-sep" />
      {btn('H1', editor.isActive('heading', { level: 1 }), () =>
        editor.chain().focus().toggleHeading({ level: 1 }).run(),
      )}
      {btn('H2', editor.isActive('heading', { level: 2 }), () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
      )}
      {btn('H3', editor.isActive('heading', { level: 3 }), () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
      )}
      <span className="toolbar-sep" />
      {btn('Bullets', editor.isActive('bulletList'), () =>
        editor.chain().focus().toggleBulletList().run(),
      )}
      {btn('Numbers', editor.isActive('orderedList'), () =>
        editor.chain().focus().toggleOrderedList().run(),
      )}
    </div>
  )
}
