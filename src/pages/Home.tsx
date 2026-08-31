import React from 'react';
import { HomeReturningUserBanner } from '../components/public/HomeReturningUserBanner';
import { HeroSection } from '../components/public/HeroSection';
import { HomeMealPreview } from '../components/public/HomeMealPreview';
import { HomeThreeBenefits } from '../components/public/HomeThreeBenefits';
import { HomeMadeForEveryday } from '../components/public/HomeMadeForEveryday';
import { HomeFinalCTA } from '../components/public/HomeFinalCTA';

export const Home: React.FC = () => {
  return (
    <div className="w-full">
      {/* 0. Optional Compact Returning Customer Bar (only if authenticated customer) */}
      <HomeReturningUserBanner />

      {/* 1. Hero: Roz ka khana. Sahi khana. */}
      <HeroSection />

      {/* 2. Today's Meal: Aaj TEFFEIN mein kya mil raha hai? */}
      <HomeMealPreview />

      {/* 3. Why TEFFEIN: 3 Key Benefits (Freshly Cooked, Home-Style, Flexible) */}
      <HomeThreeBenefits />

      {/* 4. Made for your everyday: Segments (Students, Workers, Companies) */}
      <HomeMadeForEveryday />

      {/* 5. Final CTA: Your next meal is sorted. */}
      <HomeFinalCTA />
    </div>
  );
};
