import { marked } from 'marked'

export const SUPPORTED_IMPORT_TYPES = [
  { ext: '.txt', label: 'Plain text (.txt)', mime: 'text/plain' },
  { ext: '.md', label: 'Markdown (.md)', mime: 'text/markdown' },
] as const

export function isSupportedImportFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return name.endsWith('.txt') || name.endsWith('.md')
}

function textToDocJson(text: string) {
  const paragraphs = text.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return {
    type: 'doc',
    content: paragraphs.map((block) => ({
      type: 'paragraph',
      content: block
        ? [{ type: 'text', text: block.replace(/\n/g, ' ') }]
        : undefined,
    })),
  }
}

function htmlToDocJson(html: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const content: unknown[] = []

  const walk = (el: Element) => {
    const tag = el.tagName.toLowerCase()
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      const level = Number(tag[1])
      const text = el.textContent?.trim()
      content.push({
        type: 'heading',
        attrs: { level },
        content: text ? [{ type: 'text', text }] : undefined,
      })
      return
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.children)
        .filter((c) => c.tagName.toLowerCase() === 'li')
        .map((li) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: li.textContent?.trim()
                ? [{ type: 'text', text: li.textContent.trim() }]
                : undefined,
            },
          ],
        }))
      content.push({
        type: tag === 'ul' ? 'bulletList' : 'orderedList',
        content: items,
      })
      return
    }
    if (tag === 'p' || tag === 'div') {
      const text = el.textContent?.trim()
      content.push({
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : undefined,
      })
      return
    }
    Array.from(el.children).forEach(walk)
  }

  Array.from(doc.body.children).forEach(walk)
  if (content.length === 0) {
    const text = doc.body.textContent?.trim() || ''
    return textToDocJson(text)
  }
  return { type: 'doc', content }
}

export async function importFileToDocument(file: File): Promise<{
  title: string
  content_json: unknown
}> {
  if (!isSupportedImportFile(file)) {
    throw new Error('Unsupported file type. Import .txt or .md only.')
  }

  const raw = await file.text()
  const base = file.name.replace(/\.(txt|md)$/i, '') || 'Imported document'
  const isMd = file.name.toLowerCase().endsWith('.md')

  if (isMd) {
    const html = await marked.parse(raw, { async: true })
    return { title: base, content_json: htmlToDocJson(html) }
  }

  return { title: base, content_json: textToDocJson(raw) }
}
