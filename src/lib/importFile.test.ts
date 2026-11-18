import { describe, expect, it } from 'vitest'
import { isSupportedImportFile } from './importFile'

describe('import file helpers', () => {
  it('accepts txt and md only', () => {
    expect(isSupportedImportFile(new File(['hi'], 'notes.txt'))).toBe(true)
    expect(isSupportedImportFile(new File(['# hi'], 'notes.md'))).toBe(true)
    expect(isSupportedImportFile(new File(['x'], 'notes.docx'))).toBe(false)
  })
})
