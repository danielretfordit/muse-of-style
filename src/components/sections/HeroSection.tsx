import { Button } from "@/components/ui/button";
import { AIBadge } from "@/components/ui/ai-badge";
import { Sparkles, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80"
          alt="Elegant fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto px-6 py-20">
        <div className="max-w-xl animate-fade-up">
          <AIBadge text="Персональный AI-стилист Stilisti" className="mb-6" />
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-foreground mb-6 leading-[1.1]">
            Ваш стиль — <br />
            <span className="text-gradient">наша забота</span>
          </h1>
          
          <p className="font-body text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
            Откройте мир персонального стайлинга с помощью искусственного интеллекта. 
            Создавайте идеальные образы каждый день.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="group">
              <Sparkles className="w-5 h-5" />
              Начать бесплатно
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button variant="secondary" size="lg">
              Узнать больше
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating Cards Animation */}
      <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 animate-float">
        <div className="relative">
          <div className="w-64 h-80 rounded-2xl bg-card shadow-lg rotate-6 absolute -right-8 top-4" />
          <div className="w-64 h-80 rounded-2xl bg-card shadow-lg -rotate-3 absolute right-4 -top-4" />
          <div className="w-64 h-80 rounded-2xl overflow-hidden shadow-xl relative">
            <img 
              src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&q=80"
              alt="Fashion outfit"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}