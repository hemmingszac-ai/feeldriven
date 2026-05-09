import { login, signup } from '../auth/login'
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

type LoginPageProps = {
  searchParams?: {
    error?: string
    message?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Log in</CardTitle>
          <CardDescription>
            Use your email and password to access FeelDriven.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3">
            {searchParams?.error ? (
              <Alert variant="destructive">
                <AlertDescription>{searchParams.error}</AlertDescription>
              </Alert>
            ) : null}
            {searchParams?.message ? (
              <Alert>
                <AlertDescription>{searchParams.message}</AlertDescription>
              </Alert>
            ) : null}

            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  minLength={6}
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button formAction={login} type="submit">Log in</Button>
                <Button formAction={signup} type="submit" variant="secondary">
                  Sign up
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
