import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Shirt, Sparkles, CalendarDays, BarChart3 } from "lucide-react";

const navItems = [
  { key: "home",      icon: Home,         path: "/app" },
  { key: "wardrobe",  icon: Shirt,        path: "/app/wardrobe" },
  { key: "stylist",   icon: Sparkles,     path: "/app/stylist" },
  { key: "calendar",  icon: CalendarDays, path: "/app/calendar" },
  { key: "analytics", icon: BarChart3,    path: "/app/analytics" },
];

export function PlatformMobileNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-3 right-3 z-50 md:hidden">
      <div className="mx-auto max-w-sm">
        <div className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-[22px] shadow-lg shadow-black/8">
          <div className="flex items-center justify-around h-16 px-1">
            {navItems.map((item) => {
              const isActive =
                item.path === "/app"
                  ? location.pathname === "/app"
                  : location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2 px-2.5 rounded-2xl transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-2xl bg-primary/10" />
                  )}
                  <item.icon
                    className={cn(
                      "w-[19px] h-[19px] relative z-10 transition-transform duration-200",
                      isActive && "scale-110"
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span
                    className={cn(
                      "font-body text-[9px] sm:text-[10px] relative z-10 leading-none transition-all duration-200",
                      isActive ? "font-semibold" : "font-normal"
                    )}
                  >
                    {t(`platform.nav.${item.key}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
