import { describe, expect, it } from 'vitest'
import {
  canManageShares,
  canRead,
  canShare,
  canWrite,
  classifyDocument,
} from '../permissions.js'

describe('document permissions', () => {
  it('allows owners full access', () => {
    expect(canRead('owner')).toBe(true)
    expect(canWrite('owner')).toBe(true)
    expect(canShare('owner')).toBe(true)
    expect(canManageShares('owner')).toBe(true)
  })

  it('allows write shares to edit but not share', () => {
    expect(canRead('write')).toBe(true)
    expect(canWrite('write')).toBe(true)
    expect(canShare('write')).toBe(false)
  })

  it('allows read shares to view only', () => {
    expect(canRead('read')).toBe(true)
    expect(canWrite('read')).toBe(false)
    expect(canShare('read')).toBe(false)
  })

  it('denies users with no access', () => {
    expect(canRead(null)).toBe(false)
    expect(canWrite(null)).toBe(false)
    expect(canShare(null)).toBe(false)
  })

  it('classifies owned vs shared list sections', () => {
    const alice = '11111111-1111-4111-8111-111111111111'
    const bob = '22222222-2222-4222-8222-222222222222'
    expect(classifyDocument(alice, alice)).toBe('owned')
    expect(classifyDocument(alice, bob)).toBe('shared')
  })
})
