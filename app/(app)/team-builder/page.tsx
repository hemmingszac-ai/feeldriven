import { redirect } from 'next/navigation'
import { submitTeamBuilderInput } from './actions'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type TeamBuilderPageProps = {
  searchParams?: {
    error?: string
    status?: string
  }
}

export default async function TeamBuilderPage({
  searchParams,
}: TeamBuilderPageProps) {
  const { user } = await getCurrentUserProfile()

  if (user.user_metadata?.role !== 'Team Manager') {
    redirect('/dashboard')
  }

  const showSuccess = searchParams?.status === 'ready'

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Team Builder</CardTitle>
          <CardDescription>
            Paste details for a new job and attach supporting files. We will
            wire this into AI team matching in the next step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitTeamBuilderInput} className="grid gap-4">
            {searchParams?.error ? (
              <Alert variant="destructive">
                <AlertDescription>{searchParams.error}</AlertDescription>
              </Alert>
            ) : null}

            {showSuccess ? (
              <Alert>
                <AlertDescription>
                  Inputs captured. AI team scoring is not connected yet.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="emailComms">Email communications</Label>
              <Textarea
                id="emailComms"
                name="emailComms"
                placeholder="Paste relevant email thread content here."
                className="min-h-40"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="jobDescription">Job description</Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                placeholder="Describe the project goals, constraints, and deliverables."
                className="min-h-40"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attachments">Attachments (optional)</Label>
              <Input id="attachments" name="attachments" type="file" multiple />
              <p className="text-xs text-muted-foreground">
                Add one or more supporting files. Files are collected as inputs
                only in this phase.
              </p>
            </div>

            <Button type="submit" className="w-fit">
              Continue to AI processing
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
