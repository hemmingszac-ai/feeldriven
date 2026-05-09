import { redirect } from 'next/navigation'
import { createClient } from './lib/supabase/server'
import { CtaSection } from '@/components/landing/cta-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { FooterSection } from '@/components/landing/footer-section'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { Navigation } from '@/components/landing/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/shout-outs')
  }

  return (
    <main className="landing-page noise-overlay relative min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}
