import { redirect } from 'next/navigation'
import { Megaphone } from 'lucide-react'
import { createShoutOut } from './actions'
import { normalizeShoutOuts, type ShoutOut } from './feed'
import { SHOUT_OUT_MAX_MESSAGE_LENGTH } from './validation'
import { createClient } from '../lib/supabase/server'
import { AppShell } from '@/components/app-shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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

function getProfileName(profile?: Profile) {
  if (!profile) {
    return 'Unknown teammate'
  }

  return `${profile.first_name} ${profile.last_name}`
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function ShoutOutsPage({
  searchParams,
}: ShoutOutsPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('id', user.id)
    .maybeSingle<Profile>()

  if (currentProfileError || !currentProfile) {
    redirect('/profile/setup')
  }

  const { data: profiles = [] } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .order('first_name', { ascending: true })
    .order('last_name', { ascending: true })

  const { data: shoutOutRows } = await supabase
    .from('shout_outs')
    .select('id, sender_id, recipient_id, message, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const shoutOuts = normalizeShoutOuts(shoutOutRows as ShoutOut[] | null)
  const profileMap = new Map(
    (profiles as Profile[]).map((profile) => [profile.id, profile])
  )
  const recipientOptions = (profiles as Profile[]).filter(
    (profile) => profile.id !== user.id
  )
  const currentUserName = getProfileName(currentProfile)

  return (
    <AppShell
      active="shout-outs"
      userEmail={user.email}
      userName={currentUserName}
    >
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recognize a teammate</CardTitle>
            <CardDescription>
              Share quick praise for work that deserves to be seen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createShoutOut} className="grid gap-4">
              {searchParams?.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{searchParams.error}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-2">
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
                      {getProfileName(profile)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  maxLength={SHOUT_OUT_MAX_MESSAGE_LENGTH}
                  placeholder="Call out what they achieved and why it mattered."
                  required
                />
              </div>

              <Button type="submit" className="w-fit">
                <Megaphone className="size-4" />
                Post shout-out
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="grid gap-3" aria-label="Recent shout-outs">
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
              const sender = getProfileName(profileMap.get(shoutOut.sender_id))
              const recipient = getProfileName(
                profileMap.get(shoutOut.recipient_id)
              )

              return (
                <Card key={shoutOut.id}>
                  <CardHeader>
                    <CardTitle>
                      {sender} praised {recipient}
                    </CardTitle>
                    <CardDescription>
                      {formatTimestamp(shoutOut.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-7">{shoutOut.message}</p>
                  </CardContent>
                </Card>
              )
            })
          )}
        </section>
      </div>
    </AppShell>
  )
}
