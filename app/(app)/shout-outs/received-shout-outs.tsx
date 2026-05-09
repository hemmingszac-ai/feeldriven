import { Megaphone } from 'lucide-react'
import { formatProfileName } from '@/app/lib/profiles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoutOutCard, getShoutOutCardClassName } from './shout-out-card'

type ReceivedShoutOutProfile = {
  id: string
  first_name: string
  last_name: string
}

export type ReceivedShoutOut = {
  id: string
  message: string
  created_at: string
  sender: ReceivedShoutOutProfile | ReceivedShoutOutProfile[] | null
}

type ReceivedShoutOutsProps = {
  shoutOuts: ReceivedShoutOut[]
  emptyMessage: string
  recipientId: string
  recipientName: string
}

export function ReceivedShoutOuts({
  shoutOuts,
  emptyMessage,
  recipientId,
  recipientName,
}: ReceivedShoutOutsProps) {
  return (
    <Card>
      <CardHeader className="gap-0.5">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="size-4" />
          Shout-outs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shoutOuts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="grid gap-3">
            {shoutOuts.map((shoutOut) => {
              const sender = Array.isArray(shoutOut.sender)
                ? shoutOut.sender[0] ?? null
                : shoutOut.sender
              const senderName = formatProfileName(sender)

              return (
                <ShoutOutCard
                  key={shoutOut.id}
                  recipientId={recipientId}
                  recipient={recipientName}
                  senderId={sender?.id}
                  sender={senderName}
                  message={shoutOut.message}
                  createdAt={shoutOut.created_at}
                  compact
                  className={getShoutOutCardClassName(shoutOut.message)}
                />
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
