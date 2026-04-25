import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, MapPin, RefreshCw } from "lucide-react";

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

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-full" />
              <div>
                <Skeleton className="h-7 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-12 w-full sm:w-36" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-primary/20">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-primary/10 rounded-full text-3xl sm:text-4xl">
              {weather?.icon || "☁️"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-xl sm:text-2xl font-semibold">
                  {weather?.temperature ?? "--"}°C
                </span>
                <Badge variant="secondary" className="font-body text-xs sm:text-sm">
                  {weather ? getConditionLabel(weather.condition) : "--"}
                </Badge>
                <button
                  onClick={onRefresh}
                  className="p-1 hover:bg-primary/10 rounded-full transition-colors"
                  title={t("platform.dashboard.weather.refresh")}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-body">
                  {weather?.location || t("platform.dashboard.weather.loading")}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={onGetOutfit} className="gap-2 w-full sm:w-auto">
            <Sparkles className="w-4 h-4" />
            {t("platform.dashboard.getOutfit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
