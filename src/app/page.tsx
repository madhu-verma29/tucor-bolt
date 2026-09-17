import React from 'react';
import { ThemeProvider } from '@/lib/theme-provider';
import LandingNav from '@/components/LandingNav';
import HeroSection from '@/app/components/HeroSection';
import ImpactCounters from '@/app/components/ImpactCounters';
import HowItWorks from '@/app/components/HowItWorks';
import ForSellers from '@/app/components/ForSellers';
import ForBuyers from '@/app/components/ForBuyers';
import VerificationTrust from '@/app/components/VerificationTrust';
import SustainabilitySection from '@/app/components/SustainabilitySection';
import FAQSection from '@/app/components/FAQSection';
import FinalCTA from '@/app/components/FinalCTA';
import LandingFooter from '@/app/components/LandingFooter';

export default function PublicLandingPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <LandingNav />
        <main>
          <HeroSection />
          <ImpactCounters />
          <HowItWorks />
          <ForSellers />
          <ForBuyers />
          <VerificationTrust />
          <SustainabilitySection />
          <FAQSection />
          <FinalCTA />
        </main>
        <LandingFooter />
      </div>
    </ThemeProvider>
  );
}