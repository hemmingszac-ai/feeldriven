export type ShoutOut = {
  id: string
  sender_id: string
  recipient_id: string
  message: string
  created_at: string
}

export type ShoutOutProfile = {
  id: string
  first_name: string
  last_name: string
}

export type ShoutOutWithProfiles = ShoutOut & {
  sender: ShoutOutProfile | null
  recipient: ShoutOutProfile | null
}

export function normalizeShoutOuts<TShoutOut extends ShoutOut>(
  shoutOuts: TShoutOut[] | null | undefined
) {
  return shoutOuts ?? []
}
