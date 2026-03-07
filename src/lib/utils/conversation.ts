import { createHash } from 'crypto'

const NAMESPACE = 'clanka-chat-conversations'

export function generateConversationId(userA: string, userB: string): string {
  const sorted = [userA, userB].sort()
  const hash = createHash('sha256')
    .update(`${NAMESPACE}:${sorted[0]}:${sorted[1]}`)
    .digest('hex')

  // Format as UUID-shaped string (deterministic, not RFC 4122)
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join('-')
}
