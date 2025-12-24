"use client";

import { Navigation } from "@/components/sections/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { PlatformsSection } from "@/components/sections/PlatformsSection";
import { ObjectivesSection } from "@/components/sections/ObjectivesSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { Footer } from "@/components/sections/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5">
      <Navigation />
      <HeroSection />
      <PlatformsSection />
      <ObjectivesSection />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
