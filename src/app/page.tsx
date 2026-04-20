import Hero from '@/components/sections/Hero'
import LogoMarquee from '@/components/sections/LogoMarquee'
import Problem from '@/components/sections/Problem'
import HowItWorks from '@/components/sections/HowItWorks'
import Features from '@/components/sections/Features'
import GlobalReach from '@/components/sections/GlobeCTA'
import SuccessNumbers from '@/components/sections/SuccessNumbers'
import Testimonials from '@/components/sections/Testimonials'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import FinalCTA from '@/components/sections/FinalCTA'

export default function Home() {
  return (
    <main>
      <Hero />
      <LogoMarquee />
      <Problem />
      <HowItWorks />
      <Features />
      <SuccessNumbers />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <GlobalReach />
    </main>
  )
}
