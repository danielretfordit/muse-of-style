import { Instagram, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import logoStilisti from "@/assets/logo-stilisti.png";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-lg bg-card/90 flex items-center justify-center p-1.5">
                <img 
                  src={logoStilisti} 
                  alt="Stilisti" 
                  className="h-full w-auto"
                  width={17}
                  height={28}
                />
              </div>
              <span className="font-display text-xl font-semibold text-background tracking-wide">
                Stilisti
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground max-w-sm mb-6">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-background hover:bg-secondary/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-background hover:bg-secondary/20 transition-colors">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">{t("footer.product")}</h4>
            <ul className="space-y-3">
              {["features", "faq", "blog"].map((key) => (
                <li key={key}>
                  <a href="#" className="font-body text-sm text-muted-foreground hover:text-background transition-colors">
                    {t(`footer.links.${key}`)}
                  </a>
                </li>
              ))}
              <li>
                <a href="/pricing" className="font-body text-sm text-muted-foreground hover:text-background transition-colors">
                  {t("footer.links.pricing")}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">{t("footer.company")}</h4>
            <ul className="space-y-3">
              {["about", "careers", "contacts", "privacy"].map((key) => (
                <li key={key}>
                  <a href="#" className="font-body text-sm text-muted-foreground hover:text-background transition-colors">
                    {t(`footer.links.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-card/10">
          <p className="font-body text-sm text-muted-foreground text-center">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}