import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Sparkles,
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  Heart,
  Calendar,
  Share2,
  MoreHorizontal,
  Shirt,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// DEV MODE: Mock data
const DEV_BYPASS_AUTH = import.meta.env.DEV;

interface Look {
  id: string;
  name: string;
  occasion: string;
  tags: string[];
  image_url: string;
  items_count: number;
  is_favorite: boolean;
  created_at: string;
}

const occasions = [
  { key: "all", labelKey: "all" },
  { key: "casual", labelKey: "casual" },
  { key: "business", labelKey: "business" },
  { key: "evening", labelKey: "evening" },
  { key: "vacation", labelKey: "vacation" },
  { key: "sport", labelKey: "sport" },
];

const mockLooks: Look[] = [
  {
    id: "look-1",
    name: "Деловой шик",
    occasion: "business",
    tags: ["офис", "классика", "элегантность"],
    image_url: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80",
    items_count: 4,
    is_favorite: true,
    created_at: "2026-02-01",
  },
  {
    id: "look-2",
    name: "Уютный кэжуал",
    occasion: "casual",
    tags: ["уик-энд", "кэжуал", "комфорт"],
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
    items_count: 3,
    is_favorite: false,
    created_at: "2026-02-02",
  },
  {
    id: "look-3",
    name: "Вечерний выход",
    occasion: "evening",
    tags: ["вечер", "элегантность", "особый случай"],
    image_url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
    items_count: 5,
    is_favorite: true,
    created_at: "2026-02-03",
  },
  {
    id: "look-4",
    name: "Летний отдых",
    occasion: "vacation",
    tags: ["лето", "отпуск", "лёгкость"],
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80",
    items_count: 4,
    is_favorite: false,
    created_at: "2026-02-04",
  },
  {
    id: "look-5",
    name: "Осенние слои",
    occasion: "casual",
    tags: ["осень", "многослойность", "уют"],
    image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80",
    items_count: 5,
    is_favorite: false,
    created_at: "2026-02-05",
  },
  {
    id: "look-6",
    name: "Минималистичный офис",
    occasion: "business",
    tags: ["минимализм", "офис", "строгость"],
    image_url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80",
    items_count: 3,
    is_favorite: true,
    created_at: "2026-02-05",
  },
];

function LookCard({ look, onFavorite }: { look: Look; onFavorite: (id: string) => void }) {
  const { t } = useTranslation();
  
  return (
    <Card className="group overflow-hidden card-hover cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={look.image_url}
          alt={look.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(look.id);
            }}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
              look.is_favorite
                ? "bg-primary text-primary-foreground"
                : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-primary"
            )}
          >
            <Heart className={cn("w-4 h-4", look.is_favorite && "fill-current")} />
          </button>
        </div>
        
        {/* Items count badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
            <Shirt className="w-3 h-3 mr-1" />
            {look.items_count} {t("platform.looks.items")}
          </Badge>
        </div>
        
        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-lg font-semibold text-white mb-2">
            {look.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {look.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-white/10 border-white/20 text-white text-xs backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Looks() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOccasion, setSelectedOccasion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchLooks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // In dev mode, use mock data
    if (DEV_BYPASS_AUTH) {
      setLooks(mockLooks);
      setLoading(false);
      return;
    }

    // TODO: Fetch from database when looks table is created
    setLooks([]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLooks();
  }, [fetchLooks]);

  const filteredLooks = looks.filter((look) => {
    const matchesOccasion = selectedOccasion === "all" || look.occasion === selectedOccasion;
    const matchesSearch =
      look.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      look.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesOccasion && matchesSearch;
  });

  const handleFavorite = (id: string) => {
    setLooks(looks.map((look) =>
      look.id === id ? { ...look, is_favorite: !look.is_favorite } : look
    ));
  };

  const hasLooks = looks.length > 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {t("platform.looks.title")}
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            {t("platform.looks.subtitle")}
          </p>
        </div>
        <Button onClick={() => navigate("/app/stylist")} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {t("platform.looks.create")}
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Occasion Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {occasions.map((occasion) => (
            <Button
              key={occasion.key}
              variant={selectedOccasion === occasion.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedOccasion(occasion.key)}
              className="shrink-0"
            >
              {t(`platform.looks.occasions.${occasion.labelKey}`)}
            </Button>
          ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("platform.looks.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
              )}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4]">
              <Skeleton className="w-full h-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : hasLooks ? (
        <>
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>
              {t("platform.looks.total")}: <strong className="text-foreground">{looks.length}</strong>
            </span>
            <span>
              {t("platform.looks.favorites")}: <strong className="text-foreground">{looks.filter(l => l.is_favorite).length}</strong>
            </span>
          </div>

          {/* Looks Grid */}
          <div className={cn(
            "grid gap-4 md:gap-6",
            viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
          )}>
            {filteredLooks.map((look) => (
              <LookCard key={look.id} look={look} onFavorite={handleFavorite} />
            ))}
          </div>

          {/* Empty filtered state */}
          {filteredLooks.length === 0 && (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">
                {t("platform.looks.noResults")}
              </p>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-semibold mb-3">
              {t("platform.looks.emptyState.title")}
            </h3>
            <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
              {t("platform.looks.emptyState.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/app/stylist")} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {t("platform.looks.emptyState.cta")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/app/wardrobe")} className="gap-2">
                <Shirt className="w-4 h-4" />
                {t("platform.looks.emptyState.addWardrobe")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
