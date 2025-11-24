'use client';

import Hero from './sections/Hero';
import PostWarEra from './sections/PostWarEra';
import TurningPoint from './sections/TurningPoint';
import FinancialCrisis from './sections/FinancialCrisis';
import CovidAcceleration from './sections/CovidAcceleration';
import HowItWorks from './sections/HowItWorks';
import HumanCost from './sections/HumanCost';
import Solution from './sections/Solution';
import CaseStudies from './sections/CaseStudies';
import CallToAction from './sections/CallToAction';

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <PostWarEra />
      <TurningPoint />
      <FinancialCrisis />
      <CovidAcceleration />
      <HowItWorks />
      <HumanCost />
      <Solution />
      <CaseStudies />
      <CallToAction />
    </main>
  );
}
