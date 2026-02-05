import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Star } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary to-primary-pressed relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-card rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl" />
      </div>
      
      {/* Floating stars */}
      <Star className="absolute top-16 right-[20%] w-6 h-6 text-gold/40 animate-float" />
      <Star className="absolute bottom-24 left-[15%] w-4 h-4 text-secondary/30 animate-float" style={{ animationDelay: '1s' }} />
      <Star className="absolute top-1/2 right-[10%] w-5 h-5 text-card/20 animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/10 backdrop-blur-sm border border-card/20 mb-8">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="font-body text-sm text-primary-foreground">Бесплатная пробная версия</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-primary-foreground mb-6 leading-tight">
            Готовы преобразить свой стиль?
          </h2>
          
          <p className="font-body text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            Присоединяйтесь к тысячам пользователей, которые уже открыли для себя силу AI-стайлинга
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-card text-foreground hover:bg-card/90 shadow-lg group"
            >
              <Sparkles className="w-5 h-5" />
              Попробовать бесплатно
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Посмотреть демо
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-primary-foreground/10">
            {[
              { value: "50K+", label: "Пользователей" },
              { value: "1M+", label: "Образов создано" },
              { value: "4.9", label: "Рейтинг" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-semibold text-primary-foreground mb-1">
                  {stat.value}
                </div>
                <div className="font-body text-sm text-primary-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}