import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AIBadge } from "@/components/ui/ai-badge";
import { Sparkles, RefreshCw, X, Lightbulb, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DEV_BYPASS_AUTH } from "@/lib/devMode";
import { toast } from "@/hooks/use-toast";
import { extractStoragePath, getSignedUrls } from "@/lib/storage";
import { AnalysisProgress, type AnalysisStep } from "./AnalysisProgress";
import { ItemDetailSheet } from "@/components/wardrobe/ItemDetailSheet";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  brand: string | null;
  image_url: string;
  season?: 'winter' | 'summer' | 'demi' | 'all' | null;
}

interface RecommendedItem {
  wardrobe_item_id: string;
  reason: string;
  item: WardrobeItem;
}

interface AnalysisSummary {
  total_analyzed: number;
  categories_checked: string[];
  missing_categories: Array<{ category: string; message: string }>;
}

interface OutfitRecommendation {
  items: RecommendedItem[];
  explanation: string;
  style_tips: string[];
  analysis_summary?: AnalysisSummary;
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

// Category configuration for progress display
const CATEGORY_KEYS = ['shoes', 'outerwear', 'tops', 'bottoms', 'accessories'] as const;

// Mock wardrobe for dev mode
const MOCK_WARDROBE: WardrobeItem[] = [
  { id: "1", name: "Cashmere Sweater", category: "tops", color: "beige", brand: "Zara", image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80" },
  { id: "2", name: "Wool Coat", category: "outerwear", color: "camel", brand: "Massimo Dutti", image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=300&q=80" },
  { id: "3", name: "Dark Jeans", category: "bottoms", color: "navy", brand: "Levi's", image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80" },
  { id: "4", name: "Leather Boots", category: "shoes", color: "brown", brand: "COS", image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=300&q=80" },
  { id: "5", name: "Silk Scarf", category: "accessories", color: "burgundy", brand: "H&M", image_url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=300&q=80" },
];

// Pre-filter items by weather and season
function prefilterByWeather(items: WardrobeItem[], temperature: number): WardrobeItem[] {
  return items.filter(item => {
    // If season is not specified — pass to AI for visual analysis
    if (!item.season) return true;
    
    // If season is specified — apply rules
    if (temperature < 5 && item.season === 'summer') return false;
    if (temperature > 25 && item.season === 'winter') return false;
    
    return true;
  });
}

export function AIOutfitSuggestion({ weather, onClose }: AIOutfitSuggestionProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedImages, setSignedImages] = useState<Map<string, string>>(new Map());
  
  // Progress state
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Item detail sheet state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  // Initialize analysis steps
  const initializeSteps = (): AnalysisStep[] => {
    return CATEGORY_KEYS.map(key => ({
      id: key,
      label: t(`platform.dashboard.aiStylist.categories.${key}`),
      status: 'pending' as const,
    }));
  };

  // Get signed URLs for private wardrobe images
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!recommendation?.items || DEV_BYPASS_AUTH) return;

      const paths: string[] = [];
      recommendation.items.forEach((item) => {
        const path = extractStoragePath(item.item.image_url, "wardrobe");
        if (path) paths.push(path);
      });

      if (paths.length > 0) {
        const urlMap = await getSignedUrls("wardrobe", paths);
        setSignedImages(urlMap);
      }
    };

    fetchSignedUrls();
  }, [recommendation]);

  const getImageUrl = (item: WardrobeItem): string => {
    if (DEV_BYPASS_AUTH) return item.image_url;
    
    const path = extractStoragePath(item.image_url, "wardrobe");
    if (path && signedImages.has(path)) {
      return signedImages.get(path)!;
    }
    return item.image_url;
  };

  // Simulate progress animation during AI analysis
  const simulateProgress = () => {
    const steps = initializeSteps();
    setAnalysisSteps(steps);
    setAnalysisProgress(0);

    let currentStep = 0;
    const totalSteps = steps.length;

    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        setAnalysisSteps(prev => prev.map((step, idx) => {
          if (idx === currentStep) {
            return { ...step, status: 'processing' };
          }
          if (idx < currentStep) {
            return { ...step, status: 'done' };
          }
          return step;
        }));
        setAnalysisProgress(((currentStep + 0.5) / totalSteps) * 100);
        currentStep++;
      }
    }, 1500); // Simulate ~1.5s per category

    return () => clearInterval(interval);
  };

  // Handle click on item card — fetch full data and open detail sheet
  const handleItemClick = async (itemId: string) => {
    if (DEV_BYPASS_AUTH) return;
    setLoadingItemId(itemId);
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("id", itemId)
        .maybeSingle();

      if (data && !error) {
        // Get signed URL for the image if needed
        const path = extractStoragePath(data.image_url, "wardrobe");
        if (path) {
          const urlMap = await getSignedUrls("wardrobe", [path]);
          if (urlMap.has(path)) {
            data.image_url = urlMap.get(path)!;
          }
        }
        setSelectedItem(data);
        setIsDetailOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: t("platform.dashboard.aiStylist.error"),
          description: "Item not found",
        });
      }
    } catch (err) {
      console.error("Failed to load item details:", err);
    } finally {
      setLoadingItemId(null);
    }
  };

  // Handlers for ItemDetailSheet
  const handleUpdateItem = async (id: string, updates: Record<string, any>) => {
    const { error } = await supabase
      .from("wardrobe_items")
      .update(updates)
      .eq("id", id);
    if (!error) {
      setSelectedItem((prev: any) => prev ? { ...prev, ...updates } : prev);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const item = selectedItem;
    if (item) {
      const path = extractStoragePath(item.image_url, "wardrobe");
      if (path) {
        await supabase.storage.from("wardrobe").remove([path]);
      }
    }
    const { error } = await supabase
      .from("wardrobe_items")
      .delete()
      .eq("id", id);
    if (!error) {
      // Remove the item from recommendation
      setRecommendation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter(i => i.wardrobe_item_id !== id),
        };
      });
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("wardrobe_items")
      .update({ is_favorite: !current })
      .eq("id", id);
    if (!error) {
      setSelectedItem((prev: any) => prev ? { ...prev, is_favorite: !current } : prev);
    }
  };

  const fetchRecommendation = async () => {
    if (!weather) return;

    setLoading(true);
    setError(null);
    setRecommendation(null);

    // Start progress animation
    const stopProgress = simulateProgress();

    try {
      // Fetch wardrobe items
      let wardrobe: WardrobeItem[] = [];

      if (DEV_BYPASS_AUTH) {
        wardrobe = MOCK_WARDROBE;
      } else if (user) {
        const { data, error: fetchError } = await supabase
          .from("wardrobe_items")
          .select("id, name, category, color, brand, image_url, season")
          .eq("user_id", user.id);

        if (fetchError) throw fetchError;
        wardrobe = (data || []) as WardrobeItem[];
      }

      if (wardrobe.length === 0) {
        setError(t("platform.dashboard.aiStylist.noItems"));
        setLoading(false);
        return;
      }

      // Pre-filter by weather/season
      const filteredWardrobe = prefilterByWeather(wardrobe, weather.temperature);

      // Get signed URLs for all wardrobe images (for AI to fetch)
      let wardrobeWithSignedUrls = filteredWardrobe;
      
      if (!DEV_BYPASS_AUTH) {
        const paths: string[] = [];
        filteredWardrobe.forEach((item) => {
          const path = extractStoragePath(item.image_url, "wardrobe");
          if (path) paths.push(path);
        });
        
        if (paths.length > 0) {
          const urlMap = await getSignedUrls("wardrobe", paths);
          
          wardrobeWithSignedUrls = filteredWardrobe.map((item) => {
            const path = extractStoragePath(item.image_url, "wardrobe");
            if (path && urlMap.has(path)) {
              return { ...item, image_url: urlMap.get(path)! };
            }
            return item;
          });
        }
      }

      // Call AI stylist edge function
      const { data, error: funcError } = await supabase.functions.invoke("ai-stylist", {
        body: {
          weather: {
            temperature: weather.temperature,
            condition: weather.condition,
            humidity: weather.humidity,
          },
          wardrobe: wardrobeWithSignedUrls,
          occasion: "casual",
          language: i18n.language,
        },
      });

      if (funcError) throw funcError;
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Update steps with final results
      if (data.analysis_summary) {
        const summary = data.analysis_summary as AnalysisSummary;
        setAnalysisSteps(prev => prev.map(step => {
          const found = data.items.find((i: RecommendedItem) => 
            i.item.category === step.id
          );
          const missing = summary.missing_categories.find(m => m.category === step.id);

          if (found) {
            return { ...step, status: 'done', result: found.item.name };
          }
          if (missing) {
            return { ...step, status: 'missing', result: missing.message };
          }
          if (!summary.categories_checked.includes(step.id)) {
            return { ...step, status: 'skipped' };
          }
          return { ...step, status: 'done' };
        }));
      }

      setAnalysisProgress(100);

      // Small delay to show completed progress
      await new Promise(resolve => setTimeout(resolve, 500));

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
      stopProgress();
      setLoading(false);
    }
  };

  // Initial state - show prompt to generate
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

  // Loading state with progress
  if (loading) {
    return <AnalysisProgress steps={analysisSteps} progress={analysisProgress} />;
  }

  // Error state
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

  // Check if we have items and missing categories
  const hasItems = recommendation?.items && recommendation.items.length > 0;
  const hasMissingCategories = recommendation?.analysis_summary?.missing_categories && 
    recommendation.analysis_summary.missing_categories.length > 0;

  // Result state
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

        {/* Scenario 1: Has items - show grid with optional warning */}
        {hasItems ? (
          <>
            {/* Missing categories warning */}
            {hasMissingCategories && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    {recommendation!.analysis_summary!.missing_categories.map((m, i) => (
                      <span key={m.category}>
                        {m.message}
                        {i < recommendation!.analysis_summary!.missing_categories.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Items Grid - adaptive columns based on count */}
            <div className={`grid gap-2 mb-4 ${
              recommendation!.items.length <= 2 
                ? 'grid-cols-2' 
                : recommendation!.items.length === 3 
                  ? 'grid-cols-3' 
                  : 'grid-cols-4'
            }`}>
              {recommendation!.items.map((item) => (
                <div 
                  key={item.wardrobe_item_id} 
                  className="relative group cursor-pointer"
                  onClick={() => handleItemClick(item.wardrobe_item_id)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted ring-0 hover:ring-2 hover:ring-primary/50 transition-all">
                    {loadingItemId === item.wardrobe_item_id && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <img
                      src={getImageUrl(item.item)}
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
          </>
        ) : (
          /* Scenario 2: No items found - show empty state */
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-display text-base font-semibold mb-2">
              {t("platform.dashboard.aiStylist.noSuitableItems")}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {recommendation?.explanation || t("platform.dashboard.aiStylist.noSuitableItemsDesc")}
            </p>
            
            {/* List of missing categories */}
            {hasMissingCategories && (
              <div className="bg-muted/50 rounded-lg p-3 text-left mb-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {t("platform.dashboard.aiStylist.missingCategories")}:
                </p>
                <ul className="text-xs space-y-1">
                  {recommendation!.analysis_summary!.missing_categories.map((m) => (
                    <li key={m.category} className="text-muted-foreground">
                      • {m.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions - always visible */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRecommendation} className="gap-2 flex-1">
            <RefreshCw className="w-4 h-4" />
            {t("platform.dashboard.aiStylist.another")}
          </Button>
        </div>
      </CardContent>

      {/* Item Detail Sheet */}
      <ItemDetailSheet
        item={selectedItem}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
        onToggleFavorite={handleToggleFavorite}
      />
    </Card>
  );
}
