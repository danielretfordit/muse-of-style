import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Check,
  Camera,
  User,
  Ruler,
  Palette,
  MapPin,
  Heart,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  photos: string[];
  body_type: string | null;
  height: number | null;
  weight: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  shoe_size: string | null;
  preferred_styles: string[];
  favorite_colors: string[];
  disliked_colors: string[];
  preferred_brands: string[];
  budget_min: number | null;
  budget_max: number | null;
  occasion_preferences: Record<string, boolean>;
  location_city: string | null;
  location_country: string | null;
  latitude: number | null;
  longitude: number | null;
  gender: string | null;
  birth_date: string | null;
  style_avatars: unknown[];
}

interface ProfileCompletionProps {
  profile: ProfileData;
  className?: string;
}

interface CompletionSection {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  weight: number;
  isComplete: boolean;
  fields: string[];
}

export function ProfileCompletion({ profile, className }: ProfileCompletionProps) {
  const sections = useMemo<CompletionSection[]>(() => {
    return [
      {
        key: "basic",
        label: "Основное",
        icon: User,
        weight: 15,
        isComplete: !!(profile.full_name && profile.gender && profile.birth_date),
        fields: ["Имя", "Пол", "Дата рождения"],
      },
      {
        key: "avatar",
        label: "Аватар",
        icon: Camera,
        weight: 10,
        isComplete: !!profile.avatar_url,
        fields: ["Фото профиля"],
      },
      {
        key: "photos",
        label: "Фотографии",
        icon: Camera,
        weight: 15,
        isComplete: profile.photos.length >= 1,
        fields: ["Минимум 1 фото"],
      },
      {
        key: "measurements",
        label: "Параметры",
        icon: Ruler,
        weight: 15,
        isComplete: !!(profile.height && profile.body_type),
        fields: ["Рост", "Тип фигуры"],
      },
      {
        key: "styles",
        label: "Стили",
        icon: Palette,
        weight: 15,
        isComplete: profile.preferred_styles.length >= 1,
        fields: ["Любимые стили"],
      },
      {
        key: "colors",
        label: "Цвета",
        icon: Heart,
        weight: 10,
        isComplete: profile.favorite_colors.length >= 1,
        fields: ["Любимые цвета"],
      },
      {
        key: "occasions",
        label: "Случаи",
        icon: Sparkles,
        weight: 10,
        isComplete: Object.values(profile.occasion_preferences).some(Boolean),
        fields: ["Типичные случаи"],
      },
      {
        key: "location",
        label: "Локация",
        icon: MapPin,
        weight: 10,
        isComplete: !!(profile.latitude && profile.longitude),
        fields: ["Геолокация"],
      },
    ];
  }, [profile]);

  const { percentage, completedCount, totalCount } = useMemo(() => {
    const completed = sections.filter((s) => s.isComplete);
    const totalWeight = sections.reduce((acc, s) => acc + s.weight, 0);
    const completedWeight = completed.reduce((acc, s) => acc + s.weight, 0);
    
    return {
      percentage: Math.round((completedWeight / totalWeight) * 100),
      completedCount: completed.length,
      totalCount: sections.length,
    };
  }, [sections]);

  const getProgressColor = (pct: number) => {
    if (pct < 30) return "bg-destructive";
    if (pct < 60) return "bg-amber-500";
    if (pct < 90) return "bg-emerald-500";
    return "bg-gradient-to-r from-emerald-500 to-primary";
  };

  const getStatusText = (pct: number) => {
    if (pct < 30) return "Начните заполнение";
    if (pct < 60) return "Хорошее начало!";
    if (pct < 90) return "Почти готово!";
    return "Отличный профиль!";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Progress Card */}
      <div className="relative overflow-hidden rounded-xl border bg-card p-5">
        {/* Decorative background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)`,
          }}
        />
        
        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">
                Полнота профиля
              </h3>
              <p className="text-sm text-muted-foreground">
                {getStatusText(percentage)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary font-display">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/30">
            <div
              className={cn(
                "h-full transition-all duration-700 ease-out rounded-full",
                getProgressColor(percentage)
              )}
              style={{ width: `${percentage}%` }}
            />
            {/* Shimmer effect */}
            {percentage < 100 && (
              <div 
                className="absolute inset-0 shimmer opacity-30"
                style={{ width: `${percentage}%` }}
              />
            )}
          </div>

          {/* Section Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Badge
                  key={section.key}
                  variant={section.isComplete ? "default" : "outline"}
                  className={cn(
                    "gap-1.5 px-3 py-1.5 transition-all duration-300",
                    section.isComplete
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {section.isComplete ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="text-xs font-medium">{section.label}</span>
                </Badge>
              );
            })}
          </div>

          {/* Completed count */}
          <p className="text-xs text-muted-foreground pt-1">
            Заполнено {completedCount} из {totalCount} разделов
          </p>
        </div>
      </div>
    </div>
  );
}

// Export a hook for reusing completion logic
export function useProfileCompletion(profile: ProfileData | null) {
  return useMemo(() => {
    if (!profile) return { percentage: 0, isComplete: false };
    
    const checks = [
      !!(profile.full_name && profile.gender && profile.birth_date),
      !!profile.avatar_url,
      profile.photos.length >= 1,
      !!(profile.height && profile.body_type),
      profile.preferred_styles.length >= 1,
      profile.favorite_colors.length >= 1,
      Object.values(profile.occasion_preferences).some(Boolean),
      !!(profile.latitude && profile.longitude),
    ];
    
    const weights = [15, 10, 15, 15, 15, 10, 10, 10];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const completedWeight = checks.reduce((acc, check, i) => 
      acc + (check ? weights[i] : 0), 0
    );
    
    const percentage = Math.round((completedWeight / totalWeight) * 100);
    
    return { 
      percentage, 
      isComplete: percentage === 100,
    };
  }, [profile]);
}
