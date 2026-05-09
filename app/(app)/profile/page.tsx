import { Award, Brain, Mail, Sparkles } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { getProfileInitials } from '@/app/lib/profiles'
import {
  ProfileDetailsGrid,
  ProfileGrowthCard,
  ProfileHero,
  ProfileMetricsGrid,
} from '@/components/profile-view'
import {
  ReceivedShoutOuts,
  type ReceivedShoutOut,
} from '../shout-outs/received-shout-outs'

export default async function ProfilePage() {
  const { profile, supabase, user, userName } = await getCurrentUserProfile()
  const userEmail = profile.email ?? user.email ?? 'Email not set'
  const role = user.user_metadata?.role ?? 'Role not set'
  const skillCount = profile.skills_to_develop.length
  const workModeCount = profile.enjoyable_work.length

  const { data: shoutOuts = [] } = await supabase
    .from('shout_outs')
    .select(
      `
      id,
      message,
      created_at,
      sender:profiles!shout_outs_sender_id_fkey(id, first_name, last_name)
    `
    )
    .eq('recipient_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="grid gap-6">
      <ProfileHero
        eyebrow="FeelDriven profile"
        name={userName}
        initials={getProfileInitials(profile)}
        meta={
          <p className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span className="truncate">{userEmail}</span>
          </p>
        }
        action={
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
            <Award className="size-4" />
            {role}
          </div>
        }
      />

      <ProfileMetricsGrid
        metrics={[
          {
            icon: Brain,
            title: 'Skills',
            description: 'Development signals captured.',
            value: skillCount,
          },
          {
            icon: Sparkles,
            title: 'Work modes',
            description: 'Preferred contribution styles.',
            value: workModeCount,
          },
        ]}
      />

      <ProfileDetailsGrid
        sections={[
          {
            title: 'Skills to develop',
            description:
              'Growth areas FeelDriven can use when shaping missions.',
            items: profile.skills_to_develop,
            emptyMessage: 'Nothing recorded yet.',
          },
          {
            title: 'Work you enjoy most',
            description:
              'The work patterns most likely to keep momentum high.',
            items: profile.enjoyable_work,
            emptyMessage: 'Nothing recorded yet.',
          },
        ]}
      />

      <ProfileGrowthCard
        title="Growth direction"
        description="Projects that should stretch you in a good way."
      >
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {profile.stretch_projects}
        </p>
      </ProfileGrowthCard>

      <ReceivedShoutOuts
        shoutOuts={shoutOuts as ReceivedShoutOut[]}
        emptyMessage="No shout-outs yet. Recognition from teammates will appear here."
        recipientName={userName}
      />
    </div>
  )
}
