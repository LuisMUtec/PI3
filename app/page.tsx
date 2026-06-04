import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { TrustBand } from "@/components/landing/trust-band";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Topics } from "@/components/landing/topics";
import { SafetyHelp } from "@/components/landing/safety-help";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <TrustBand />
        <HowItWorks />
        <Topics />
        <SafetyHelp />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
