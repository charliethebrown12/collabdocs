import type { AccessLevel } from './db.js'

/** Pure helpers — unit-tested without a database. */

export function canRead(access: AccessLevel): boolean {
  return access === 'owner' || access === 'write' || access === 'read'
}

export function canWrite(access: AccessLevel): boolean {
  return access === 'owner' || access === 'write'
}

export function canShare(access: AccessLevel): boolean {
  return access === 'owner'
}

export function canManageShares(access: AccessLevel): boolean {
  return access === 'owner'
}

export type ListSection = 'owned' | 'shared'

export function classifyDocument(
  ownerId: string,
  currentUserId: string,
): ListSection {
  return ownerId === currentUserId ? 'owned' : 'shared'
}
