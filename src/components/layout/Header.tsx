import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  
  // Track scroll position
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 20);
    });
  }

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-card/95 backdrop-blur-md shadow-sm py-3" 
        : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border-[1.5px] border-primary flex items-center justify-center">
              <span className="font-display text-xl font-semibold text-primary">S</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground hidden sm:block">
              Stilisti
            </span>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.features")}
            </a>
            <a href="#looks" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.looks")}
            </a>
            <a href="#wardrobe" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.wardrobe")}
            </a>
            <a href="#pricing" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.pricing")}
            </a>
          </nav>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden sm:block" />
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              {t("nav.login")}
            </Button>
            <Button size="sm" className="hidden sm:flex">
              <Sparkles className="w-4 h-4" />
              {t("nav.start")}
            </Button>
            
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}