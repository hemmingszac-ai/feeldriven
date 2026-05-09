export type ShoutOut = {
  id: string
  sender_id: string
  recipient_id: string
  message: string
  created_at: string
}

export function normalizeShoutOuts(
  shoutOuts: ShoutOut[] | null | undefined
) {
  return shoutOuts ?? []
}
