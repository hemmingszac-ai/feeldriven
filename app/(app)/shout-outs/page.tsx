import { Megaphone } from 'lucide-react'
import { formatProfileName } from '@/app/lib/profiles'
import { createShoutOut } from './actions'
import { normalizeShoutOuts, type ShoutOutWithProfiles } from './feed'
import { SHOUT_OUT_MAX_MESSAGE_LENGTH } from './validation'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type ShoutOutsPageProps = {
  searchParams?: {
    error?: string
  }
}

type Profile = {
  id: string
  first_name: string
  last_name: string
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getPosterClassName(message: string) {
  if (message.length > 220) {
    return 'min-h-72'
  }

  if (message.length > 120) {
    return 'min-h-56'
  }

  return 'min-h-44'
}

export default async function ShoutOutsPage({
  searchParams,
}: ShoutOutsPageProps) {
  const { supabase, user } = await getCurrentUserProfile()

  const [profilesResult, shoutOutsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .order('first_name', { ascending: true })
      .order('last_name', { ascending: true }),
    supabase
      .from('shout_outs')
      .select(
        `
        id,
        sender_id,
        recipient_id,
        message,
        created_at,
        sender:profiles!shout_outs_sender_id_fkey(id, first_name, last_name),
        recipient:profiles!shout_outs_recipient_id_fkey(id, first_name, last_name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const shoutOuts = normalizeShoutOuts(
    shoutOutsResult.data as ShoutOutWithProfiles[] | null
  )
  const recipientOptions = ((profilesResult.data ?? []) as Profile[]).filter(
    (profile) => profile.id !== user.id
  )

  return (
    <div className="mx-auto flex h-[calc(100svh-5.5rem)] w-full max-w-4xl flex-col gap-3">
      <section
        className="min-h-0 flex-1 overflow-y-auto pr-1"
        aria-label="Recent shout-outs"
      >
        <div className="columns-1 gap-3 pb-2 sm:columns-2 xl:columns-3">
          {shoutOuts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="font-medium">No shout-outs yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first to recognize a teammate.
                </p>
              </CardContent>
            </Card>
          ) : (
            shoutOuts.map((shoutOut) => {
              const sender = formatProfileName(shoutOut.sender)
              const recipient = formatProfileName(shoutOut.recipient)

              return (
                <Card
                  key={shoutOut.id}
                  className={`mb-3 inline-block w-full max-w-none break-inside-avoid ${getPosterClassName(
                    shoutOut.message
                  )}`}
                >
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
                        <p className="text-balance text-xl font-semibold leading-snug">
                          "{shoutOut.message}"
                        </p>
                      </div>

                      <div className="border-t pt-3 text-sm">
                        <p className="font-medium">Recognized by {sender}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatTimestamp(shoutOut.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </section>

      <Card className="shrink-0" size="sm">
        <CardHeader className="gap-0.5">
          <CardTitle>Recognize a teammate</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createShoutOut} className="grid gap-3">
            {searchParams?.error ? (
              <Alert variant="destructive">
                <AlertDescription>{searchParams.error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-3 md:grid-cols-[1fr_14rem] md:items-end">
              <div className="grid gap-2 md:col-start-1 md:row-start-1 md:row-span-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  maxLength={SHOUT_OUT_MAX_MESSAGE_LENGTH}
                  placeholder="Call out what they achieved and why it mattered."
                  required
                  className="min-h-20 md:min-h-[6.5rem]"
                />
              </div>

              <div className="grid gap-2 md:col-start-2 md:row-start-1">
                <Label htmlFor="recipientId">Recipient</Label>
                <select
                  id="recipientId"
                  name="recipientId"
                  required
                  className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choose a teammate
                  </option>
                  {recipientOptions.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {formatProfileName(profile)}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="w-fit md:col-start-2 md:row-start-2 md:w-full"
              >
                <Megaphone className="size-4" />
                Post shout-out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
