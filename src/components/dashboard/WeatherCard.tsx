import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, MapPin, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  icon: string;
  location: string;
}

interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
  onRefresh: () => void;
  onGetOutfit: () => void;
}

const weatherConfig: Record<string, { gradient: string; border: string; ring: string }> = {
  sunny:         { gradient: "from-amber-50 via-yellow-50/60 to-orange-50/30", border: "border-amber-200/60", ring: "bg-amber-100/80" },
  partly_cloudy: { gradient: "from-sky-50 via-blue-50/60 to-slate-50/30",     border: "border-sky-200/60",   ring: "bg-sky-100/80" },
  cloudy:        { gradient: "from-slate-100 via-gray-50/60 to-slate-50/30",   border: "border-slate-200/60", ring: "bg-slate-100/80" },
  foggy:         { gradient: "from-gray-100 via-slate-50/60 to-gray-50/30",    border: "border-gray-200/60",  ring: "bg-gray-100/80" },
  drizzle:       { gradient: "from-blue-50 via-slate-50/60 to-indigo-50/30",   border: "border-blue-200/60",  ring: "bg-blue-100/80" },
  rainy:         { gradient: "from-blue-100 via-indigo-50/60 to-blue-50/30",   border: "border-blue-300/60",  ring: "bg-blue-100/80" },
  snowy:         { gradient: "from-sky-100 via-blue-50/60 to-indigo-50/30",    border: "border-sky-200/60",   ring: "bg-sky-100/80" },
  stormy:        { gradient: "from-slate-200 via-gray-100/60 to-slate-100/30", border: "border-slate-300/60", ring: "bg-slate-200/80" },
};

const defaultWeatherConfig = {
  gradient: "from-primary/8 via-primary/4 to-transparent",
  border: "border-primary/20",
  ring: "bg-primary/10",
};

export function WeatherCard({ weather, loading, onRefresh, onGetOutfit }: WeatherCardProps) {
  const { t } = useTranslation();

  const getConditionLabel = (condition: string) => {
    const conditionMap: Record<string, string> = {
      sunny: t("platform.dashboard.weather.sunny"),
      partly_cloudy: t("platform.dashboard.weather.partlyCloudy"),
      cloudy: t("platform.dashboard.weather.cloudy"),
      foggy: t("platform.dashboard.weather.foggy"),
      drizzle: t("platform.dashboard.weather.drizzle"),
      rainy: t("platform.dashboard.weather.rainy"),
      snowy: t("platform.dashboard.weather.snowy"),
      stormy: t("platform.dashboard.weather.stormy"),
    };
    return conditionMap[condition] || t("platform.dashboard.weatherCloudy");
  };

  const config = weather ? (weatherConfig[weather.condition] ?? defaultWeatherConfig) : defaultWeatherConfig;

  if (loading) {
    return (
      <div className={`rounded-2xl border bg-gradient-to-br ${defaultWeatherConfig.gradient} ${defaultWeatherConfig.border} p-4 sm:p-5`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-xl hidden sm:block" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-300",
        config.gradient,
        config.border
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: icon + temp + location */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className={cn("w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-sm", config.ring)}>
              {weather?.icon || "☁️"}
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display text-3xl sm:text-4xl font-semibold leading-none">
                  {weather?.temperature ?? "--"}°
                </span>
                <span className="font-body text-sm text-muted-foreground">
                  {weather ? getConditionLabel(weather.condition) : "--"}
                </span>
                <button
                  onClick={onRefresh}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors"
                  title={t("platform.dashboard.weather.refresh")}
                >
                  <RefreshCw className="w-3 h-3 text-muted-foreground/60" />
                </button>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                <span className="font-body text-xs text-muted-foreground truncate">
                  {weather?.location || t("platform.dashboard.weather.loading")}
                </span>
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <Button
            onClick={onGetOutfit}
            size="sm"
            className="shrink-0 gap-1.5 rounded-xl hidden sm:flex"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("platform.dashboard.getOutfit")}
          </Button>
        </div>

        {/* Mobile CTA */}
        <Button
          onClick={onGetOutfit}
          size="sm"
          className="w-full mt-3 gap-2 rounded-xl sm:hidden"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t("platform.dashboard.getOutfit")}
        </Button>
      </div>
    </div>
  );
}
