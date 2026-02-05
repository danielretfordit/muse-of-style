import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { LooksSection } from "@/components/sections/LooksSection";
import { WardrobeSection } from "@/components/sections/WardrobeSection";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Code } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Dev Button - Remove in production */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/app")}
          className="bg-destructive/10 border-destructive text-destructive hover:bg-destructive hover:text-white"
        >
          <Code className="w-4 h-4" />
          Dev: Портал
        </Button>
      </div>
      
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
