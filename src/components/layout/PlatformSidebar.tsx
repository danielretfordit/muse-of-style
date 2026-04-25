import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import logoStilisti from "@/assets/logo-stilisti.png";
import {
  Home,
  Shirt,
  Sparkles,
  ImageIcon,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

const navItems = [
  { key: "home",      icon: Home,         path: "/app" },
  { key: "wardrobe",  icon: Shirt,        path: "/app/wardrobe" },
  { key: "stylist",   icon: Sparkles,     path: "/app/stylist" },
  { key: "looks",     icon: ImageIcon,    path: "/app/looks" },
  { key: "calendar",  icon: CalendarDays, path: "/app/calendar" },
  { key: "analytics", icon: BarChart3,    path: "/app/analytics" },
];

const bottomItems = [
  { key: "settings", icon: Settings, path: "/app/settings" },
];

export function PlatformSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInitials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    user?.email?.[0].toUpperCase() ||
    "U";

  const isActive = (path: string) =>
    path === "/app" ? location.pathname === "/app" : location.pathname.startsWith(path);

  return (
    <aside
      className={cn(
        "h-screen bg-card/80 backdrop-blur-xl border-r border-border/40 flex flex-col transition-all duration-300 shadow-sm",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4", collapsed ? "justify-center" : "justify-between")}>
        <button
          onClick={() => navigate("/app")}
          className={cn("flex items-center gap-2.5 min-w-0", collapsed && "justify-center")}
        >
          <img src={logoStilisti} alt="Stilisti" className="h-7 w-auto shrink-0" />
          {!collapsed && (
            <span className="font-display text-lg font-semibold text-foreground tracking-wide truncate">
              Stilisti
            </span>
          )}
        </button>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center pb-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed(false)}
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      )}

      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      {/* Main Navigation */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center rounded-xl transition-all duration-200 text-sm font-body",
                collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-medium ring-1 ring-inset ring-primary/10"
                  : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
              )}
              title={collapsed ? t(`platform.nav.${item.key}`) : undefined}
            >
              <item.icon
                className={cn("shrink-0 transition-transform duration-200", collapsed ? "w-5 h-5" : "w-4 h-4", active && "scale-110")}
                strokeWidth={active ? 2.2 : 1.8}
              />
              {!collapsed && (
                <span>{t(`platform.nav.${item.key}`)}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-2.5 space-y-0.5">
        <div className="mx-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent mb-2" />

        {bottomItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center rounded-xl transition-all duration-200 text-sm font-body",
                collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-medium ring-1 ring-inset ring-primary/10"
                  : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
              )}
              title={collapsed ? t(`platform.nav.${item.key}`) : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {!collapsed && <span>{t(`platform.nav.${item.key}`)}</span>}
            </button>
          );
        })}

        {/* User Card */}
        <div
          className={cn(
            "flex items-center rounded-xl hover:bg-primary/[0.08] hover:ring-1 hover:ring-primary/10 cursor-pointer transition-all duration-200 mt-1",
            collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"
          )}
          onClick={() => navigate("/app/profile")}
          title={collapsed ? (user?.user_metadata?.full_name || t("platform.nav.profile")) : undefined}
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/12 text-primary text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs font-medium text-foreground truncate">
                {user?.user_metadata?.full_name || t("platform.nav.profile")}
              </p>
              <p className="font-body text-[10px] text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center rounded-xl transition-all duration-200 text-sm font-body text-muted-foreground hover:bg-destructive/8 hover:text-destructive",
            collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2.5"
          )}
          title={collapsed ? t("platform.nav.logout") : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t("platform.nav.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
