import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, 
  Shirt, 
  ImageIcon, 
  TrendingUp,
  Plus,
  CloudSun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// DEV MODE: Mock data
const DEV_BYPASS_AUTH = import.meta.env.DEV;

interface DashboardStats {
  wardrobeCount: number;
  looksCount: number;
  favoritesCount: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    wardrobeCount: 0,
    looksCount: 0,
    favoritesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || 
                    user?.email?.split("@")[0] || 
                    t("platform.dashboard.user");

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // In dev mode, use mock data
    if (DEV_BYPASS_AUTH) {
      setStats({
        wardrobeCount: 8,
        looksCount: 3,
        favoritesCount: 3,
      });
      setLoading(false);
      return;
    }

    try {
      // Fetch wardrobe count
      const { count: wardrobeCount, error: wardrobeError } = await supabase
        .from("wardrobe_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (wardrobeError) throw wardrobeError;

      // Fetch favorites count
      const { count: favoritesCount, error: favoritesError } = await supabase
        .from("wardrobe_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_favorite", true);

      if (favoritesError) throw favoritesError;

      // TODO: Add looks table when implemented
      // For now, looks count is 0 in production
      setStats({
        wardrobeCount: wardrobeCount || 0,
        looksCount: 0, // Will be implemented with looks table
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

  const statsCards = [
    { key: "wardrobe", value: stats.wardrobeCount, icon: Shirt, path: "/app/wardrobe" },
    { key: "looks", value: stats.looksCount, icon: ImageIcon, path: "/app/looks" },
    { key: "saved", value: stats.favoritesCount, icon: TrendingUp, path: "/app/wardrobe" },
  ];

  const quickActions = [
    { key: "addItem", icon: Plus, path: "/app/wardrobe", variant: "default" as const },
    { key: "generateLook", icon: Sparkles, path: "/app/stylist", variant: "secondary" as const },
    { key: "browseIdeas", icon: ImageIcon, path: "/app/looks", variant: "outline" as const },
  ];

  const hasWardrobe = stats.wardrobeCount > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <section className="space-y-1 sm:space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground">
          {t("platform.dashboard.greeting", { name: firstName })}
        </h1>
        <p className="font-body text-muted-foreground text-base sm:text-lg">
          {t("platform.dashboard.subtitle")}
        </p>
      </section>

      {/* Weather & Suggestion Card */}
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-full">
                <CloudSun className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl sm:text-2xl font-semibold">12°C</span>
                  <Badge variant="secondary" className="font-body text-xs sm:text-sm">
                    {t("platform.dashboard.weatherCloudy")}
                  </Badge>
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  {t("platform.dashboard.weatherSuggestion")}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/app/stylist")} className="gap-2 w-full sm:w-auto">
              <Sparkles className="w-4 h-4" />
              {t("platform.dashboard.getOutfit")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        {statsCards.map((stat) => (
          <Card 
            key={stat.key} 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(stat.path)}
          >
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-body text-[10px] sm:text-sm text-muted-foreground">
                    {t(`platform.dashboard.stats.${stat.key}`)}
                  </p>
                  {loading ? (
                    <Skeleton className="h-7 sm:h-9 w-8 sm:w-12 mt-1" />
                  ) : (
                    <p className="font-display text-xl sm:text-3xl font-semibold mt-0.5 sm:mt-1">
                      {stat.value}
                    </p>
                  )}
                </div>
                <div className="hidden sm:block p-3 bg-accent rounded-full">
                  <stat.icon className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
          {t("platform.dashboard.quickActions")}
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant}
              size="lg"
              className="h-auto py-4 sm:py-6 flex-col gap-2 sm:gap-3"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-body text-[10px] sm:text-sm text-center leading-tight">{t(`platform.dashboard.actions.${action.key}`)}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Empty State / Getting Started - Only show when no wardrobe items */}
      {!loading && !hasWardrobe && (
        <Card className="border-dashed">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Shirt className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">
              {t("platform.dashboard.emptyState.title")}
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
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
