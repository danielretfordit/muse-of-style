import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "ru", label: "RU", fullName: "Русский" },
  { code: "en", label: "EN", fullName: "English" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLang.label}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50 min-w-[140px] animate-scale-in">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between",
                  lang.code === i18n.language
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary/20"
                )}
              >
                <span>{lang.fullName}</span>
                <span className="text-xs text-muted-foreground">{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}