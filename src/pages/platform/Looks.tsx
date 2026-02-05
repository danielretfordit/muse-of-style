import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Search,
  Grid3X3,
  LayoutList,
  Heart,
  Calendar,
  Share2,
  Shirt,
  X,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Bookmark,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// DEV MODE: Mock data
const DEV_BYPASS_AUTH = import.meta.env.DEV;

interface WardrobeItem {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  image_url: string;
  price: number | null;
  currency: string;
  ownership_status: "owned" | "saved";
}

interface Look {
  id: string;
  name: string;
  occasion: string;
  tags: string[];
  image_url: string;
  items: WardrobeItem[];
  is_favorite: boolean;
  created_at: string;
  description?: string;
}

const occasions = [
  { key: "all", labelKey: "all" },
  { key: "casual", labelKey: "casual" },
  { key: "business", labelKey: "business" },
  { key: "evening", labelKey: "evening" },
  { key: "vacation", labelKey: "vacation" },
  { key: "sport", labelKey: "sport" },
];

// Mock wardrobe items for looks
const mockWardrobeItems: WardrobeItem[] = [
  {
    id: "item-1",
    name: "Кашемировый свитер",
    brand: "Max Mara",
    category: "tops",
    image_url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
    price: 45900,
    currency: "RUB",
    ownership_status: "owned",
  },
  {
    id: "item-2",
    name: "Шёлковая блузка",
    brand: "Theory",
    category: "tops",
    image_url: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&q=80",
    price: 28500,
    currency: "RUB",
    ownership_status: "owned",
  },
  {
    id: "item-3",
    name: "Шерстяные брюки",
    brand: "Totême",
    category: "bottoms",
    image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
    price: 52000,
    currency: "RUB",
    ownership_status: "owned",
  },
  {
    id: "item-4",
    name: "Кашемировое пальто",
    brand: "The Row",
    category: "outerwear",
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
    price: 189000,
    currency: "RUB",
    ownership_status: "owned",
  },
  {
    id: "item-5",
    name: "Кожаные лодочки",
    brand: "Gianvito Rossi",
    category: "shoes",
    image_url: "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=400&q=80",
    price: 67000,
    currency: "RUB",
    ownership_status: "saved",
  },
  {
    id: "item-6",
    name: "Кожаная сумка Cassette",
    brand: "Bottega Veneta",
    category: "accessories",
    image_url: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&q=80",
    price: 245000,
    currency: "RUB",
    ownership_status: "saved",
  },
  {
    id: "item-7",
    name: "Шёлковое платье миди",
    brand: "Zimmermann",
    category: "dresses",
    image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80",
    price: 78000,
    currency: "RUB",
    ownership_status: "saved",
  },
  {
    id: "item-8",
    name: "Джинсовая куртка",
    brand: "Acne Studios",
    category: "outerwear",
    image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
    price: 42000,
    currency: "RUB",
    ownership_status: "owned",
  },
];

const mockLooks: Look[] = [
  {
    id: "look-1",
    name: "Деловой шик",
    occasion: "business",
    tags: ["офис", "классика", "элегантность"],
    image_url: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80",
    items: [mockWardrobeItems[1], mockWardrobeItems[2], mockWardrobeItems[4], mockWardrobeItems[5]],
    is_favorite: true,
    created_at: "2026-02-01",
    description: "Идеальный образ для важных встреч и презентаций. Сочетание классических силуэтов с современными акцентами.",
  },
  {
    id: "look-2",
    name: "Уютный кэжуал",
    occasion: "casual",
    tags: ["уик-энд", "кэжуал", "комфорт"],
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
    items: [mockWardrobeItems[0], mockWardrobeItems[7], mockWardrobeItems[2]],
    is_favorite: false,
    created_at: "2026-02-02",
    description: "Расслабленный образ для прогулок и встреч с друзьями.",
  },
  {
    id: "look-3",
    name: "Вечерний выход",
    occasion: "evening",
    tags: ["вечер", "элегантность", "особый случай"],
    image_url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
    items: [mockWardrobeItems[6], mockWardrobeItems[4], mockWardrobeItems[5], mockWardrobeItems[1], mockWardrobeItems[3]],
    is_favorite: true,
    created_at: "2026-02-03",
    description: "Утончённый вечерний образ для особых случаев и торжественных мероприятий.",
  },
  {
    id: "look-4",
    name: "Летний отдых",
    occasion: "vacation",
    tags: ["лето", "отпуск", "лёгкость"],
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80",
    items: [mockWardrobeItems[6], mockWardrobeItems[5], mockWardrobeItems[4], mockWardrobeItems[0]],
    is_favorite: false,
    created_at: "2026-02-04",
    description: "Лёгкий и воздушный образ для отпуска и путешествий.",
  },
  {
    id: "look-5",
    name: "Осенние слои",
    occasion: "casual",
    tags: ["осень", "многослойность", "уют"],
    image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80",
    items: [mockWardrobeItems[0], mockWardrobeItems[3], mockWardrobeItems[2], mockWardrobeItems[4], mockWardrobeItems[5]],
    is_favorite: false,
    created_at: "2026-02-05",
    description: "Многослойный образ для прохладных осенних дней.",
  },
  {
    id: "look-6",
    name: "Минималистичный офис",
    occasion: "business",
    tags: ["минимализм", "офис", "строгость"],
    image_url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80",
    items: [mockWardrobeItems[1], mockWardrobeItems[2], mockWardrobeItems[4]],
    is_favorite: true,
    created_at: "2026-02-05",
    description: "Чистые линии и сдержанные цвета для минималистичного офисного стиля.",
  },
];

function formatPrice(price: number | null, currency: string) {
  if (!price) return null;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function LookCard({ 
  look, 
  onFavorite, 
  onClick 
}: { 
  look: Look; 
  onFavorite: (id: string) => void;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  
  return (
    <Card className="group overflow-hidden card-hover cursor-pointer" onClick={onClick}>
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
            {look.items.length} {t("platform.looks.items")}
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

function LookDetailDialog({ 
  look, 
  open, 
  onOpenChange,
  onFavorite 
}: { 
  look: Look | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onFavorite: (id: string) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  if (!look) return null;

  const totalPrice = look.items.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("platform.looks.detail.linkCopied"));
    } catch {
      toast.error(t("platform.looks.detail.copyError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Look Image */}
          <div className="relative w-full md:w-1/2 aspect-[3/4] md:aspect-auto md:min-h-[600px]">
            <img
              src={look.image_url}
              alt={look.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
          </div>
          
          {/* Right: Details */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="p-6 pb-4 border-b">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {t(`platform.looks.occasions.${look.occasion}`)}
                  </Badge>
                  <DialogTitle className="font-display text-2xl">
                    {look.name}
                  </DialogTitle>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onFavorite(look.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border",
                      look.is_favorite
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground hover:text-primary border-border hover:border-primary"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", look.is_favorite && "fill-current")} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {look.description && (
                <p className="font-body text-muted-foreground mt-2">
                  {look.description}
                </p>
              )}
            </DialogHeader>
            
            {/* Items List */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-foreground">
                    {t("platform.looks.detail.composition")}
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {look.items.length} {t("platform.looks.items")}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {look.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => navigate("/app/wardrobe")}
                    >
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Ownership status indicator */}
                        <div className={cn(
                          "absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center",
                          item.ownership_status === "owned" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary text-muted-foreground"
                        )}>
                          {item.ownership_status === "owned" ? (
                            <Shirt className="w-3 h-3" />
                          ) : (
                            <Bookmark className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.brand && (
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                              {item.brand}
                            </p>
                          )}
                          {item.ownership_status === "saved" && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {t("platform.wardrobe.saved")}
                            </Badge>
                          )}
                        </div>
                        <h5 className="font-body font-medium text-foreground truncate">
                          {item.name}
                        </h5>
                        {item.price && (
                          <p className="font-body text-sm text-primary font-semibold mt-1">
                            {formatPrice(item.price, item.currency)}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
            
            {/* Footer */}
            <div className="p-6 border-t bg-accent/30">
              <div className="flex items-center justify-between mb-4">
                <span className="font-body text-muted-foreground">
                  {t("platform.looks.detail.totalValue")}
                </span>
                <span className="font-display text-xl font-semibold text-foreground">
                  {formatPrice(totalPrice, "RUB")}
                </span>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => {
                    toast.success(t("platform.looks.detail.duplicated"));
                  }}
                >
                  <Copy className="w-4 h-4" />
                  {t("platform.looks.detail.duplicate")}
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => navigate("/app/stylist")}
                >
                  <Sparkles className="w-4 h-4" />
                  {t("platform.looks.detail.editWithAI")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  const [selectedLook, setSelectedLook] = useState<Look | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    // Update selected look if it's the one being favorited
    if (selectedLook?.id === id) {
      setSelectedLook(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
    }
  };

  const handleLookClick = (look: Look) => {
    setSelectedLook(look);
    setIsDetailOpen(true);
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
              <LookCard 
                key={look.id} 
                look={look} 
                onFavorite={handleFavorite}
                onClick={() => handleLookClick(look)}
              />
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

      {/* Look Detail Dialog */}
      <LookDetailDialog
        look={selectedLook}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onFavorite={handleFavorite}
      />
    </div>
  );
}
