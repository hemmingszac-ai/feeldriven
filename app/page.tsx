import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-4xl font-semibold tracking-normal md:text-5xl">
            FieldDriven
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
          A workplace platform that makes work feel like being part of a
          high-performing team. Leaders turn tasks into shared missions, while
          live progress, recognition, and rewards make employees genuinely want
          to contribute and win together.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3">
          <h2 className="text-lg font-medium">Starter app features</h2>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li>Next.js App Router scaffold</li>
            <li>TypeScript support</li>
            <li>Responsive shadcn/ui primitives</li>
            <li>Supabase email and password auth</li>
          </ul>
        </CardContent>

        <CardFooter>
          <Link href="/login" className={buttonVariants()}>
            Log in or create an account
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
