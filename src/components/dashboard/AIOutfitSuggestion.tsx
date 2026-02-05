import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AIBadge } from "@/components/ui/ai-badge";
import { Sparkles, RefreshCw, X, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DEV_BYPASS_AUTH } from "@/lib/devMode";
import { toast } from "@/hooks/use-toast";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  brand: string | null;
  image_url: string;
}

interface RecommendedItem {
  wardrobe_item_id: string;
  reason: string;
  item: WardrobeItem;
}

interface OutfitRecommendation {
  items: RecommendedItem[];
  explanation: string;
  style_tips: string[];
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
}

interface AIOutfitSuggestionProps {
  weather: WeatherData | null;
  onClose?: () => void;
}

// Mock wardrobe for dev mode
const MOCK_WARDROBE: WardrobeItem[] = [
  { id: "1", name: "Cashmere Sweater", category: "tops", color: "beige", brand: "Zara", image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80" },
  { id: "2", name: "Wool Coat", category: "outerwear", color: "camel", brand: "Massimo Dutti", image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=300&q=80" },
  { id: "3", name: "Dark Jeans", category: "bottoms", color: "navy", brand: "Levi's", image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80" },
  { id: "4", name: "Leather Boots", category: "shoes", color: "brown", brand: "COS", image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=300&q=80" },
  { id: "5", name: "Silk Scarf", category: "accessories", color: "burgundy", brand: "H&M", image_url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=300&q=80" },
  { id: "6", name: "White T-Shirt", category: "tops", color: "white", brand: "Uniqlo", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80" },
  { id: "7", name: "Black Blazer", category: "outerwear", color: "black", brand: "Zara", image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&q=80" },
  { id: "8", name: "Wool Trousers", category: "bottoms", color: "gray", brand: "COS", image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&q=80" },
];

export function AIOutfitSuggestion({ weather, onClose }: AIOutfitSuggestionProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async () => {
    if (!weather) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch wardrobe items
      let wardrobe: WardrobeItem[] = [];

      if (DEV_BYPASS_AUTH) {
        wardrobe = MOCK_WARDROBE;
      } else if (user) {
        const { data, error: fetchError } = await supabase
          .from("wardrobe_items")
          .select("id, name, category, color, brand, image_url")
          .eq("user_id", user.id)
          .eq("ownership_status", "owned")
          .limit(50);

        if (fetchError) throw fetchError;
        wardrobe = data || [];
      }

      if (wardrobe.length === 0) {
        setError(t("platform.dashboard.aiStylist.noItems"));
        setLoading(false);
        return;
      }

      // Call AI stylist edge function
      const { data, error: funcError } = await supabase.functions.invoke("ai-stylist", {
        body: {
          weather: {
            temperature: weather.temperature,
            condition: weather.condition,
            humidity: weather.humidity,
          },
          wardrobe,
          occasion: "casual",
          language: i18n.language,
        },
      });

      if (funcError) throw funcError;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setRecommendation(data);
    } catch (err) {
      console.error("AI Stylist error:", err);
      const message = err instanceof Error ? err.message : "Failed to get recommendation";
      setError(message);
      toast({
        variant: "destructive",
        title: t("platform.dashboard.aiStylist.error"),
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!recommendation && !loading && !error) {
    return (
      <Card className="border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">
            {t("platform.dashboard.aiStylist.title")}
          </h3>
          <p className="font-body text-sm text-muted-foreground mb-4">
            {t("platform.dashboard.aiStylist.description")}
          </p>
          <Button onClick={fetchRecommendation} className="gap-2">
            <Sparkles className="w-4 h-4" />
            {t("platform.dashboard.aiStylist.generate")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-24 h-6" />
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-4 sm:p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={fetchRecommendation} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("platform.dashboard.aiStylist.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <AIBadge text={t("platform.dashboard.aiStylist.badge")} />
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {recommendation?.items.map((item) => (
            <div key={item.wardrobe_item_id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={item.item.image_url}
                  alt={item.item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-1 bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-medium truncate">{item.item.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Explanation */}
        <p className="font-body text-sm text-foreground mb-4">
          {recommendation?.explanation}
        </p>

        {/* Style Tips */}
        {recommendation?.style_tips && recommendation.style_tips.length > 0 && (
          <div className="bg-accent/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="font-display text-sm font-medium">
                {t("platform.dashboard.aiStylist.tips")}
              </span>
            </div>
            <ul className="space-y-1">
              {recommendation.style_tips.slice(0, 2).map((tip, index) => (
                <li key={index} className="text-xs text-muted-foreground">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRecommendation} className="gap-2 flex-1">
            <RefreshCw className="w-4 h-4" />
            {t("platform.dashboard.aiStylist.another")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
