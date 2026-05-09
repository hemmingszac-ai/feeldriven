import { Award, Brain, Mail, Sparkles, Target } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { getProfileInitials } from '@/app/lib/profiles'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PillList } from '@/components/pill-list'

export default async function ProfilePage() {
  const { profile, user, userName } = await getCurrentUserProfile()
  const userEmail = profile.email ?? user.email ?? 'Email not set'
  const role = user.user_metadata?.role ?? 'Role not set'
  const skillCount = profile.skills_to_develop.length

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
              {getProfileInitials(profile)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                FeelDriven profile
              </p>
              <h1 className="mt-1 truncate text-3xl font-semibold tracking-normal">
                {userName}
              </h1>
              <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{userEmail}</span>
              </p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
            <Award className="size-4" />
            {role}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-4" />
              Skills
            </CardTitle>
            <CardDescription>Development signals captured.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{skillCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4" />
              Work modes
            </CardTitle>
            <CardDescription>Preferred contribution styles.</CardDescription>
          </CardHeader>
          <CardContent>
            <PillList items={profile.enjoyable_work} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Skills to develop</CardTitle>
            <CardDescription>
              Growth areas FeelDriven can use when shaping missions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PillList items={profile.skills_to_develop} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work you enjoy most</CardTitle>
            <CardDescription>
              The work patterns most likely to keep momentum high.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PillList items={profile.enjoyable_work} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="size-5" />
            Growth direction
          </CardTitle>
          <CardDescription>
            Projects that should stretch you in a good way.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {profile.stretch_projects}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
