import HeroSection from '@/components/features/homepage/HeroSection';
import CausesSection from '@/components/features/homepage/CausesSection';
import PrizeDrawSection from '@/components/features/homepage/PrizeDrawSection';
import HowItWorksSection from '@/components/features/homepage/HowItWorksSection';
import TrustSection from '@/components/features/homepage/TrustSection';
import Footer from '@/components/layout/Footer';

// ──────────────────────────────────────────────────────────
// Homepage — Public landing page
// Step 5.6 — Assembles all sections in order
// Hero → Causes → PrizeDraw → HowItWorks → Trust → Footer
// ──────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main id="homepage">
      <HeroSection />
      <CausesSection />
      <PrizeDrawSection />
      <HowItWorksSection />
      <TrustSection />
      <Footer />
    </main>
  );
}
