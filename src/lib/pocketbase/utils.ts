import pb from './client'

/**
 * Returns the full URL for a file stored in a PocketBase record.
 */
export function getFileUrl(record: any, filename: string): string {
  if (!record || !filename) return ''
  return pb.files.getURL(record, filename)
}
