import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Camera,
  Image as ImageIcon,
  Link,
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  Heart,
  MoreVertical,
  Shirt,
  Upload,
} from "lucide-react";
import { ClothingCard } from "@/components/ui/clothing-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Mock data for wardrobe items
const mockWardrobeItems = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
    brand: "Max Mara",
    name: "Кашемировый свитер",
    price: "₽45,900",
    category: "tops",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&q=80",
    brand: "Theory",
    name: "Шёлковая блузка",
    price: "₽28,500",
    category: "tops",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
    brand: "Totême",
    name: "Шерстяные брюки",
    price: "₽52,000",
    category: "bottoms",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
    brand: "The Row",
    name: "Кашемировое пальто",
    price: "₽189,000",
    category: "outerwear",
  },
];

const categories = [
  { key: "all", label: "Все" },
  { key: "tops", label: "Верх" },
  { key: "bottoms", label: "Низ" },
  { key: "dresses", label: "Платья" },
  { key: "outerwear", label: "Верхняя одежда" },
  { key: "shoes", label: "Обувь" },
  { key: "accessories", label: "Аксессуары" },
];

export default function Wardrobe() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pinterestUrl, setPinterestUrl] = useState("");

  const filteredItems = mockWardrobeItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePhotoCapture = () => {
    // TODO: Implement camera capture
    console.log("Opening camera...");
    setIsAddDialogOpen(false);
  };

  const handleGalleryUpload = () => {
    // TODO: Implement gallery upload
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log("Selected files:", files);
        // TODO: Process files
      }
    };
    input.click();
  };

  const handleScreenshotImport = () => {
    // TODO: Implement screenshot import
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log("Selected screenshots:", files);
        // TODO: Process screenshots
      }
    };
    input.click();
  };

  const handlePinterestImport = () => {
    if (pinterestUrl) {
      console.log("Importing from Pinterest:", pinterestUrl);
      // TODO: Implement Pinterest import
      setPinterestUrl("");
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                  Мой гардероб
                </h1>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  {filteredItems.length} вещей
                </p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Добавить</span>
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по гардеробу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="w-4 h-4" />
                </Button>
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
              {categories.map((cat) => (
                <Button
                  key={cat.key}
                  variant={selectedCategory === cat.key ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Shirt className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Гардероб пуст
            </h3>
            <p className="font-body text-muted-foreground max-w-sm mb-6">
              Добавьте первые вещи, чтобы начать создавать стильные образы
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Добавить вещь
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-1"
            )}
          >
            {filteredItems.map((item) => (
              <ClothingCard
                key={item.id}
                image={item.image}
                brand={item.brand}
                name={item.name}
                price={item.price}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Добавить вещь</DialogTitle>
            <DialogDescription className="font-body">
              Выберите способ добавления одежды в гардероб
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="photo" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="photo" className="text-xs">
                <Camera className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="gallery" className="text-xs">
                <ImageIcon className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="screenshot" className="text-xs">
                <Upload className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="pinterest" className="text-xs">
                <Link className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="mt-4">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-display text-lg font-semibold mb-2">Сфотографировать</h4>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    Сделайте фото вашей одежды прямо сейчас
                  </p>
                  <Button onClick={handlePhotoCapture} className="gap-2">
                    <Camera className="w-4 h-4" />
                    Открыть камеру
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="mt-4">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-display text-lg font-semibold mb-2">Из галереи</h4>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    Загрузите фотографии из вашей галереи
                  </p>
                  <Button onClick={handleGalleryUpload} className="gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Выбрать фото
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="screenshot" className="mt-4">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-display text-lg font-semibold mb-2">Из скриншотов</h4>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    Загрузите скриншоты одежды из интернет-магазинов
                  </p>
                  <Button onClick={handleScreenshotImport} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Загрузить скриншоты
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pinterest" className="mt-4">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Link className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-display text-lg font-semibold mb-2">Из Pinterest</h4>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    Вставьте ссылку на пин с одеждой
                  </p>
                  <div className="w-full space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="pinterest-url" className="font-body">
                        Ссылка на Pinterest
                      </Label>
                      <Input
                        id="pinterest-url"
                        placeholder="https://pinterest.com/pin/..."
                        value={pinterestUrl}
                        onChange={(e) => setPinterestUrl(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handlePinterestImport}
                      disabled={!pinterestUrl}
                      className="w-full gap-2"
                    >
                      <Link className="w-4 h-4" />
                      Импортировать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
