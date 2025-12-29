"use client";

import { Navigation } from "@/components/sections/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { PlatformsSection } from "@/components/sections/PlatformsSection";
import { ObjectivesSection } from "@/components/sections/ObjectivesSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { Footer } from "@/components/sections/Footer";
import { TikTokCoinPopup } from "@/components/common/TikTokCoinPopup";

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen overflow-x-hidden bg-linear-to-b from-background via-background to-primary/5">
        <HeroSection />
        <PlatformsSection />
        <ObjectivesSection />
        <FeaturesSection />
        <CtaSection />
        <Footer />
      </div>

      {/* TikTok Coin Popup - shows after 3 seconds */}
      <TikTokCoinPopup
        showOnMount={true}
      />
    </>
  );
}
