import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Brain, BriefcaseBusiness, Sparkles } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { getProfileInitials } from '@/app/lib/profiles'
import { getOrganizationProfileName, type OrganizationProfile } from '../search'
import {
  ReceivedShoutOuts,
  type ReceivedShoutOut,
} from '../../shout-outs/received-shout-outs'
import { buttonVariants } from '@/components/ui/button'
import {
  ProfileDetailsGrid,
  ProfileGrowthCard,
  ProfileHero,
  ProfileMetricsGrid,
} from '@/components/profile-view'

type OrganizationMemberPageProps = {
  params: {
    id: string
  }
}

export default async function OrganizationMemberPage({ params }: OrganizationMemberPageProps) {
  const { supabase } = await getCurrentUserProfile()

  const [
    { data: profile, error: profileError },
    { data: shoutOuts = [] },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'id, first_name, last_name, role, skills_to_develop, enjoyable_work, stretch_projects'
      )
      .eq('id', params.id)
      .maybeSingle<OrganizationProfile>(),
    supabase
      .from('shout_outs')
      .select(
        `
        id,
        message,
        created_at,
        sender:profiles!shout_outs_sender_id_fkey(id, first_name, last_name)
      `
      )
      .eq('recipient_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  if (profileError || !profile) {
    notFound()
  }

  const profileName = getOrganizationProfileName(profile)
  const role = profile.role ?? 'Role not set'
  const skillCount = profile.skills_to_develop.length
  const workModeCount = profile.enjoyable_work.length

  return (
    <div className="grid gap-6">
      <ProfileHero
        name={profileName}
        initials={getProfileInitials(profile)}
        meta={
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <BriefcaseBusiness className="size-4 shrink-0" />
            <span className="truncate">{role}</span>
          </p>
        }
        action={
          <Link
            href="/organization"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <ArrowLeft className="size-4" />
            Back to organization
          </Link>
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
              'Growth areas this organization member has identified.',
            items: profile.skills_to_develop,
            emptyMessage: 'Nothing recorded yet.',
          },
          {
            title: 'Work they enjoy most',
            description:
              'Work patterns that keep contribution energizing.',
            items: profile.enjoyable_work,
            emptyMessage: 'Nothing recorded yet.',
          },
        ]}
      />

      <ProfileGrowthCard
        title="Growth direction"
        description="Projects that should stretch this organization member in a good way."
      >
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {profile.stretch_projects}
        </p>
      </ProfileGrowthCard>

      <ReceivedShoutOuts
        shoutOuts={shoutOuts as ReceivedShoutOut[]}
        emptyMessage="No shout-outs yet for this organization member."
        recipientId={profile.id}
        recipientName={profileName}
      />
    </div>
  )
}
