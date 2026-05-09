import { Megaphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type ShoutOutCardProps = {
  recipient: string
  sender: string
  message: string
  createdAt: string
  className?: string
  compact?: boolean
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function getShoutOutCardClassName(message: string) {
  if (message.length > 220) {
    return 'min-h-72'
  }

  if (message.length > 120) {
    return 'min-h-56'
  }

  return 'min-h-44'
}

export function ShoutOutCard({
  recipient,
  sender,
  message,
  createdAt,
  className,
  compact = false,
}: ShoutOutCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="gap-0.5">
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{recipient}</CardTitle>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary/10">
            <Megaphone className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm">
        <div className="flex h-full flex-col">
          <div className="flex flex-1 flex-col justify-center py-5">
            <p
              className={`text-balance ${
                compact ? 'text-base font-medium leading-6' : 'text-xl font-semibold leading-snug'
              }`}
            >
              "{message}"
            </p>
          </div>

          <div className="border-t pt-3 text-sm">
            <p className="font-medium">Recognized by {sender}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatTimestamp(createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
