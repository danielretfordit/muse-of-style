import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoStilisti from "@/assets/logo-stilisti.png";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleAnchorClick = (anchor: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled || isMobileMenuOpen
        ? "bg-card/95 backdrop-blur-md shadow-sm py-3" 
        : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <img 
              src={logoStilisti} 
              alt="Stilisti" 
              className="h-8 w-auto drop-shadow-sm"
            />
            <span className="font-display text-xl font-semibold text-foreground tracking-wide hidden sm:block">
              Stilisti
            </span>
          </a>
          
          {/* Desktop Navigation - removed pricing link */}
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
          </nav>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden sm:block" />
            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => navigate("/auth?mode=login")}>
              {t("nav.login")}
            </Button>
            <Button size="sm" className="hidden sm:flex" onClick={() => navigate("/auth")}>
              <Sparkles className="w-4 h-4" />
              {t("nav.start")}
            </Button>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/30 pt-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              <button 
                onClick={() => handleAnchorClick("#features")}
                className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                {t("nav.features")}
              </button>
              <button 
                onClick={() => handleAnchorClick("#looks")}
                className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                {t("nav.looks")}
              </button>
              <button 
                onClick={() => handleAnchorClick("#wardrobe")}
                className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                {t("nav.wardrobe")}
              </button>
              
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <LanguageSwitcher />
              </div>
              
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleNavigate("/auth?mode=login")}>
                  {t("nav.login")}
                </Button>
                <Button size="sm" className="justify-start" onClick={() => handleNavigate("/auth")}>
                  <Sparkles className="w-4 h-4" />
                  {t("nav.start")}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
