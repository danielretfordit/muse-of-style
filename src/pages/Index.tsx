import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { LooksSection } from "@/components/sections/LooksSection";
import { WardrobeSection } from "@/components/sections/WardrobeSection";
import { CTASection } from "@/components/sections/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="looks">
          <LooksSection />
        </section>
        <section id="wardrobe">
          <WardrobeSection />
        </section>
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
