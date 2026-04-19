import Hero from '@/components/sections/Hero'
import LogoMarquee from '@/components/sections/LogoMarquee'
import Problem from '@/components/sections/Problem'
import HowItWorks from '@/components/sections/HowItWorks'
import GlobalReach from '@/components/sections/GlobeCTA'
import SuccessNumbers from '@/components/sections/SuccessNumbers'
import Features from '@/components/sections/Features'

export default function Home() {
  return (
    <main>
      <Hero />
      <LogoMarquee />
      <Problem />
      <HowItWorks />
      <Features />
      <SuccessNumbers />
      <GlobalReach />
    </main>
  )
}
