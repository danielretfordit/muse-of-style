import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Shirt,
  ImageIcon,
  Heart,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEV_BYPASS_AUTH } from "@/lib/devMode";
import { useWeather } from "@/hooks/useWeather";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { AIOutfitSuggestion } from "@/components/dashboard/AIOutfitSuggestion";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";

interface DashboardStats {
  wardrobeCount: number;
  looksCount: number;
  favoritesCount: number;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    wardrobeCount: 0,
    looksCount: 0,
    favoritesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    t("platform.dashboard.user");

  const dateLocale = i18n.language === "ru" ? ru : enUS;
  const formattedDate = format(new Date(), "EEEE, d MMMM", { locale: dateLocale });

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (DEV_BYPASS_AUTH) {
      setStats({ wardrobeCount: 8, looksCount: 3, favoritesCount: 3 });
      setLoading(false);
      return;
    }

    try {
      const { count: wardrobeCount, error: wardrobeError } = await supabase
        .from("wardrobe_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (wardrobeError) throw wardrobeError;

      const { count: favoritesCount, error: favoritesError } = await supabase
        .from("wardrobe_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_favorite", true);

      if (favoritesError) throw favoritesError;

      setStats({
        wardrobeCount: wardrobeCount || 0,
        looksCount: 0,
        favoritesCount: favoritesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const { weather, loading: weatherLoading, refresh: refreshWeather } = useWeather();
  const [showAISuggestion, setShowAISuggestion] = useState(false);

  const statsCards = [
    {
      key: "wardrobe",
      value: stats.wardrobeCount,
      icon: Shirt,
      path: "/app/wardrobe",
      gradient: "from-primary/10 via-primary/5 to-transparent",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    {
      key: "looks",
      value: stats.looksCount,
      icon: ImageIcon,
      path: "/app/looks",
      gradient: "from-secondary/40 via-secondary/20 to-transparent",
      iconBg: "bg-secondary/50",
      iconColor: "text-secondary-foreground",
    },
    {
      key: "saved",
      value: stats.favoritesCount,
      icon: Heart,
      path: "/app/wardrobe",
      gradient: "from-gold/20 via-gold/10 to-transparent",
      iconBg: "bg-gold/20",
      iconColor: "text-amber-700",
    },
  ];

  const quickActions = [
    { key: "addItem", icon: Plus, path: "/app/wardrobe" },
    { key: "generateLook", icon: Sparkles, path: "/app/stylist" },
    { key: "browseIdeas", icon: ImageIcon, path: "/app/looks" },
  ];

  const hasWardrobe = stats.wardrobeCount > 0;

  return (
    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-4 sm:space-y-5"
      style={{
        background:
          "radial-gradient(ellipse at 0% 0%, hsl(var(--primary)/0.05) 0%, transparent 55%), radial-gradient(ellipse at 100% 80%, hsl(var(--secondary)/0.08) 0%, transparent 55%)",
      }}
    >
      {/* Hero Section */}
      <section className="animate-fade-up pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-xs font-body text-muted-foreground mb-4 capitalize shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
          {formattedDate}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground leading-tight">
          {t("platform.dashboard.greeting", { name: firstName })}
        </h1>
        <p className="font-body text-muted-foreground mt-2 text-sm sm:text-base">
          {t("platform.dashboard.subtitle")}
        </p>
      </section>

      {/* Weather Card */}
      <div className="animate-fade-up [animation-delay:60ms]">
        <WeatherCard
          weather={weather}
          loading={weatherLoading}
          onRefresh={refreshWeather}
          onGetOutfit={() => setShowAISuggestion(true)}
        />
      </div>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3 animate-fade-up [animation-delay:120ms]">
        {statsCards.map((stat) => (
          <Card
            key={stat.key}
            className={`cursor-pointer border-border/40 bg-gradient-to-br ${stat.gradient} bg-card hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group`}
            onClick={() => navigate(stat.path)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-xl ${stat.iconBg} ${stat.iconColor} transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-10 mb-1" />
              ) : (
                <p className="font-display text-2xl sm:text-3xl font-semibold leading-none">
                  {stat.value}
                </p>
              )}
              <p className="font-body text-[10px] sm:text-xs text-muted-foreground mt-1.5 leading-tight">
                {t(`platform.dashboard.stats.${stat.key}`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* AI Outfit Section */}
      <div className="animate-fade-up [animation-delay:180ms]">
        {showAISuggestion ? (
          <AIOutfitSuggestion
            weather={weather}
            onClose={() => setShowAISuggestion(false)}
          />
        ) : (
          <button
            onClick={() => setShowAISuggestion(true)}
            className="w-full text-left"
          >
            <Card className="border border-primary/25 bg-gradient-to-r from-primary/8 via-card to-secondary/15 hover:border-primary/45 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                <div className="shrink-0 relative">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-primary/12 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-sparkle" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base sm:text-lg font-semibold">
                    {t("platform.dashboard.aiStylist.title")}
                  </p>
                  <p className="font-body text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                    {t("platform.dashboard.aiStylist.description")}
                  </p>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <ArrowRight className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <section className="animate-fade-up [animation-delay:240ms]">
        <h2 className="font-display text-lg sm:text-xl font-semibold mb-3">
          {t("platform.dashboard.quickActions")}
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {quickActions.map((action) => (
            <button
              key={action.key}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 sm:gap-2.5 p-3 sm:p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted/80 flex items-center justify-center group-hover:bg-primary/12 group-hover:scale-105 transition-all duration-200">
                <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="font-body text-[10px] sm:text-xs text-center text-muted-foreground leading-tight group-hover:text-foreground transition-colors">
                {t(`platform.dashboard.actions.${action.key}`)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Empty State */}
      {!loading && !hasWardrobe && (
        <Card className="border-dashed border-primary/20 bg-card/60 backdrop-blur-sm animate-fade-up [animation-delay:300ms]">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center mb-4">
              <Shirt className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">
              {t("platform.dashboard.emptyState.title")}
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              {t("platform.dashboard.emptyState.description")}
            </p>
            <Button onClick={() => navigate("/app/wardrobe")} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("platform.dashboard.emptyState.cta")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
