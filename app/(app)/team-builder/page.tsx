import { redirect } from 'next/navigation'
import { TeamBuilderForm } from './team-builder-form'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function TeamBuilderPage() {
  const { user } = await getCurrentUserProfile()

  if (user.user_metadata?.role !== 'Team Manager') {
    redirect('/dashboard')
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Team Builder</CardTitle>
          <CardDescription>
            Paste details for a new job and attach supporting files to generate
            an AI team recommendation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamBuilderForm />
        </CardContent>
      </Card>
    </div>
  )
}
