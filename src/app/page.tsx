import { CTAFooter } from "@/components/CTAFooter";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { MoviePosterGrid } from "@/components/MoviePosterGrid";
import { ParentTrustSection } from "@/components/ParentTrustSection";
import { ThemeSection } from "@/components/ThemeSection";

export const revalidate = 300;

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <MoviePosterGrid />
        <HowItWorks />
        <ThemeSection />
        <ParentTrustSection />
      </main>
      <CTAFooter />
    </>
  );
}
