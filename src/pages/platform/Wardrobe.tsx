import { useState, useEffect, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Camera,
  Image as ImageIcon,
  Link,
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  Shirt,
  Upload,
  X,
  Loader2,
  ArrowLeft,
  Check,
  Heart,
  Bookmark,
} from "lucide-react";
import { ClothingCard } from "@/components/ui/clothing-card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrls, extractStoragePath } from "@/lib/storage";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { DEV_BYPASS_AUTH } from "@/lib/devMode";

interface WardrobeItem {
  id: string;
  image_url: string;
  brand: string | null;
  name: string;
  category: string;
  subcategory: string | null;
  color: string | null;
  price: number | null;
  currency: string | null;
  description: string | null;
  is_favorite: boolean;
  ownership_status: "owned" | "saved";
  source_url: string | null;
}

type OwnershipFilter = "all" | "owned" | "saved";

const categories = [
  { key: "all", label: "Все" },
  { key: "tops", label: "Верх" },
  { key: "bottoms", label: "Низ" },
  { key: "dresses", label: "Платья" },
  { key: "outerwear", label: "Верхняя одежда" },
  { key: "shoes", label: "Обувь" },
  { key: "accessories", label: "Аксессуары" },
];

const categoryOptions = categories.filter(c => c.key !== "all");

const colorOptions = [
  { key: "black", label: "Чёрный", color: "#000000" },
  { key: "white", label: "Белый", color: "#FFFFFF" },
  { key: "gray", label: "Серый", color: "#808080" },
  { key: "beige", label: "Бежевый", color: "#D4C4B0" },
  { key: "brown", label: "Коричневый", color: "#8B4513" },
  { key: "navy", label: "Тёмно-синий", color: "#1E3A5F" },
  { key: "blue", label: "Синий", color: "#0066CC" },
  { key: "red", label: "Красный", color: "#CC0000" },
  { key: "pink", label: "Розовый", color: "#FFB6C1" },
  { key: "green", label: "Зелёный", color: "#228B22" },
  { key: "yellow", label: "Жёлтый", color: "#FFD700" },
  { key: "purple", label: "Фиолетовый", color: "#800080" },
  { key: "orange", label: "Оранжевый", color: "#FF8C00" },
  { key: "multicolor", label: "Многоцветный", color: "linear-gradient(90deg, #FF0000, #00FF00, #0000FF)" },
];

type UploadStep = "select" | "preview" | "details";

export default function Wardrobe() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [uploadStep, setUploadStep] = useState<UploadStep>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pinterestUrl, setPinterestUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [importedImageBase64, setImportedImageBase64] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    color: "",
    price: "",
    description: "",
    ownershipStatus: "owned" as "owned" | "saved",
    sourceUrl: "",
  });

  // DEV MODE: Mock wardrobe items
  
  const mockWardrobeItems: WardrobeItem[] = [
    {
      id: "mock-1",
      image_url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
      brand: "Max Mara",
      name: "Кашемировый свитер",
      category: "tops",
      subcategory: null,
      color: "beige",
      price: 45900,
      currency: "RUB",
      description: null,
      is_favorite: true,
      ownership_status: "owned",
      source_url: null,
    },
    {
      id: "mock-2",
      image_url: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&q=80",
      brand: "Theory",
      name: "Шёлковая блузка",
      category: "tops",
      subcategory: null,
      color: "white",
      price: 28500,
      currency: "RUB",
      description: null,
      is_favorite: false,
      ownership_status: "owned",
      source_url: null,
    },
    {
      id: "mock-3",
      image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
      brand: "Totême",
      name: "Шерстяные брюки",
      category: "bottoms",
      subcategory: null,
      color: "gray",
      price: 52000,
      currency: "RUB",
      description: null,
      is_favorite: false,
      ownership_status: "owned",
      source_url: null,
    },
    {
      id: "mock-4",
      image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
      brand: "The Row",
      name: "Кашемировое пальто",
      category: "outerwear",
      subcategory: null,
      color: "black",
      price: 189000,
      currency: "RUB",
      description: null,
      is_favorite: true,
      ownership_status: "owned",
      source_url: null,
    },
    {
      id: "mock-5",
      image_url: "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=400&q=80",
      brand: "Gianvito Rossi",
      name: "Кожаные лодочки",
      category: "shoes",
      subcategory: null,
      color: "black",
      price: 67000,
      currency: "RUB",
      description: null,
      is_favorite: false,
      ownership_status: "saved",
      source_url: "https://pinterest.com/pin/12345",
    },
    {
      id: "mock-6",
      image_url: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&q=80",
      brand: "Bottega Veneta",
      name: "Кожаная сумка Cassette",
      category: "accessories",
      subcategory: null,
      color: "green",
      price: 245000,
      currency: "RUB",
      description: null,
      is_favorite: true,
      ownership_status: "saved",
      source_url: "https://farfetch.com/bag",
    },
    {
      id: "mock-7",
      image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80",
      brand: "Zimmermann",
      name: "Шёлковое платье миди",
      category: "dresses",
      subcategory: null,
      color: "pink",
      price: 78000,
      currency: "RUB",
      description: null,
      is_favorite: false,
      ownership_status: "saved",
      source_url: "https://instagram.com/p/12345",
    },
    {
      id: "mock-8",
      image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
      brand: "Acne Studios",
      name: "Джинсовая куртка",
      category: "outerwear",
      subcategory: null,
      color: "blue",
      price: 42000,
      currency: "RUB",
      description: null,
      is_favorite: false,
      ownership_status: "owned",
      source_url: null,
    },
  ];

  // Fetch wardrobe items
  const fetchItems = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // In dev mode, use mock items
    if (DEV_BYPASS_AUTH) {
      setWardrobeItems(mockWardrobeItems);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Generate signed URLs for private bucket images
      const items = data || [];
      const storagePaths: string[] = [];
      
      items.forEach(item => {
        // Check if it's a storage path (not external URL like unsplash)
        if (item.image_url && !item.image_url.startsWith("http")) {
          storagePaths.push(item.image_url);
        } else {
          // Try to extract path from old public URL format
          const path = extractStoragePath(item.image_url, "wardrobe");
          if (path) {
            storagePaths.push(path);
          }
        }
      });

      // Get signed URLs in batch
      const signedUrlMap = storagePaths.length > 0 
        ? await getSignedUrls("wardrobe", storagePaths)
        : new Map<string, string>();

      // Map items with signed URLs
      setWardrobeItems(items.map(item => {
        let imageUrl = item.image_url;
        
        // If it's not an external URL, try to get signed URL
        if (imageUrl && !imageUrl.startsWith("http")) {
          imageUrl = signedUrlMap.get(imageUrl) || imageUrl;
        } else if (imageUrl) {
          const path = extractStoragePath(imageUrl, "wardrobe");
          if (path) {
            imageUrl = signedUrlMap.get(path) || imageUrl;
          }
        }
        
        return {
          ...item,
          image_url: imageUrl,
          ownership_status: (item.ownership_status === "saved" ? "saved" : "owned") as "owned" | "saved",
        };
      }));
    } catch (error) {
      console.error("Error fetching wardrobe:", error);
      toast.error("Ошибка загрузки гардероба");
    } finally {
      setLoading(false);
    }
  }, [user, DEV_BYPASS_AUTH]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await fetchItems();
    toast.success(t("platform.common.refreshed"));
  }, [fetchItems, t]);

  const isMobile = useIsMobile();
  const { containerRef, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = wardrobeItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesOwnership = ownershipFilter === "all" || item.ownership_status === ownershipFilter;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesOwnership && matchesSearch;
  });

  const ownedCount = wardrobeItems.filter(i => i.ownership_status === "owned").length;
  const savedCount = wardrobeItems.filter(i => i.ownership_status === "saved").length;

  const resetUpload = () => {
    setUploadStep("select");
    setSelectedFile(null);
    setPreviewUrl(null);
    setPinterestUrl("");
    setImportedImageBase64(null);
    setFormData({
      name: "",
      brand: "",
      category: "",
      color: "",
      price: "",
      description: "",
      ownershipStatus: "owned",
      sourceUrl: "",
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetUpload();
    }
    setIsAddDialogOpen(open);
  };

  const handleFileSelect = (files: FileList | null, source: string) => {
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Пожалуйста, выберите изображение");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Размер файла не должен превышать 10 МБ");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStep("preview");
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement).files, "camera");
    input.click();
  };

  const handleGalleryUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement).files, "gallery");
    input.click();
  };

  const handleScreenshotImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement).files, "screenshot");
    input.click();
  };

  const handleUrlImport = async (url: string) => {
    if (!url.trim()) return;
    
    setAnalyzingUrl(true);
    setPinterestUrl(url);
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-clothing-url", {
        body: { url: url.trim(), language: "ru" },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Set the image preview
      setImportedImageBase64(data.imageBase64);
      setPreviewUrl(data.imageBase64);
      
      // Pre-fill form with AI analysis
      setFormData({
        name: data.analysis.name || "",
        brand: data.analysis.brand || "",
        category: data.analysis.category || "",
        color: data.analysis.color || "",
        price: "",
        description: data.analysis.description || "",
        ownershipStatus: "saved", // Items from URLs are typically saved/wishlist
        sourceUrl: data.sourceUrl || url,
      });
      
      // Go directly to details step (skip preview since AI already analyzed)
      setUploadStep("details");
      
      toast.success("Изображение загружено и проанализировано!");
    } catch (error) {
      console.error("Error importing from URL:", error);
      toast.error("Не удалось загрузить изображение. Попробуйте загрузить его напрямую.");
    } finally {
      setAnalyzingUrl(false);
    }
  };

  const handlePinterestImport = async () => {
    if (!pinterestUrl.trim()) return;
    await handleUrlImport(pinterestUrl);
  };

  const handleSaveItem = async () => {
    // Check if we have either a file or imported base64 image
    const hasImage = selectedFile || importedImageBase64;
    
    if (!hasImage || !user) {
      toast.error("Ошибка: нет изображения или пользователя");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Введите название вещи");
      return;
    }

    if (!formData.category) {
      toast.error("Выберите категорию");
      return;
    }

    setUploading(true);

    try {
      let fileName: string;
      
      if (selectedFile) {
        // Upload from file
        const fileExt = selectedFile.name.split(".").pop();
        fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("wardrobe")
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
      } else if (importedImageBase64) {
        // Upload from base64 (URL import)
        // Extract the actual base64 data and content type
        const matches = importedImageBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Invalid image data");
        }
        
        const contentType = matches[1];
        const base64Data = matches[2];
        
        // Decode base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: contentType });
        
        // Determine file extension from content type
        const extMap: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/png": "png",
          "image/gif": "gif",
          "image/webp": "webp",
        };
        const fileExt = extMap[contentType] || "jpg";
        fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("wardrobe")
          .upload(fileName, blob, { contentType });

        if (uploadError) throw uploadError;
      } else {
        throw new Error("No image to upload");
      }

      // Save item to database with the storage path
      const { error: insertError } = await supabase
        .from("wardrobe_items")
        .insert({
          user_id: user.id,
          image_url: fileName,
          name: formData.name.trim(),
          brand: formData.brand.trim() || null,
          category: formData.category,
          color: formData.color || null,
          price: formData.price ? parseFloat(formData.price) : null,
          description: formData.description.trim() || null,
          ownership_status: formData.ownershipStatus,
          source_url: formData.sourceUrl.trim() || null,
        });

      if (insertError) throw insertError;

      toast.success("Вещь добавлена в гардероб!");
      handleDialogClose(false);
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Ошибка сохранения. Попробуйте ещё раз.");
    } finally {
      setUploading(false);
    }
  };

  const renderUploadOptions = () => (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-4">
      <Card 
        className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        onClick={handleCameraCapture}
      >
        <CardContent className="flex flex-col items-center justify-center py-4 sm:py-6 px-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h4 className="font-display text-xs sm:text-sm font-semibold">Камера</h4>
          <p className="font-body text-[10px] sm:text-xs text-muted-foreground text-center mt-0.5 sm:mt-1">
            Сфотографировать
          </p>
        </CardContent>
      </Card>

      <Card 
        className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        onClick={handleGalleryUpload}
      >
        <CardContent className="flex flex-col items-center justify-center py-4 sm:py-6 px-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h4 className="font-display text-xs sm:text-sm font-semibold">Галерея</h4>
          <p className="font-body text-[10px] sm:text-xs text-muted-foreground text-center mt-0.5 sm:mt-1">
            Из фотоплёнки
          </p>
        </CardContent>
      </Card>

      <Card 
        className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        onClick={handleScreenshotImport}
      >
        <CardContent className="flex flex-col items-center justify-center py-4 sm:py-6 px-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h4 className="font-display text-xs sm:text-sm font-semibold">Скриншот</h4>
          <p className="font-body text-[10px] sm:text-xs text-muted-foreground text-center mt-0.5 sm:mt-1">
            Из магазина
          </p>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors",
          analyzingUrl && "opacity-50 pointer-events-none"
        )}
        onClick={() => {
          if (analyzingUrl) return;
          const url = prompt("Введите ссылку (Pinterest, Instagram, и т.д.):");
          if (url) {
            handleUrlImport(url);
          }
        }}
      >
        <CardContent className="flex flex-col items-center justify-center py-4 sm:py-6 px-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
            {analyzingUrl ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-spin" />
            ) : (
              <Link className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            )}
          </div>
          <h4 className="font-display text-xs sm:text-sm font-semibold">
            {analyzingUrl ? "Анализ..." : "По ссылке"}
          </h4>
          <p className="font-body text-[10px] sm:text-xs text-muted-foreground text-center mt-0.5 sm:mt-1">
            {analyzingUrl ? "AI анализирует" : "Pinterest, Instagram"}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="mt-4 space-y-4">
      <div className="relative aspect-[3/4] max-h-[300px] rounded-xl overflow-hidden bg-secondary/20 mx-auto">
        {previewUrl && (
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-contain"
          />
        )}
        <button
          onClick={resetUpload}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={resetUpload}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button className="flex-1" onClick={() => setUploadStep("details")}>
          Далее
          <Check className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="mt-4 space-y-4">
      {/* Small preview */}
      <div className="flex items-start gap-4">
        <div className="w-20 h-28 rounded-lg overflow-hidden bg-secondary/20 shrink-0">
          {previewUrl && (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="font-body text-sm">
              Название *
            </Label>
            <Input
              id="name"
              placeholder="Например: Кашемировый свитер"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand" className="font-body text-sm">
              Бренд
            </Label>
            <Input
              id="brand"
              placeholder="Например: Max Mara"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="font-body text-sm">Категория *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat.key} value={cat.key}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <Label className="font-body text-sm">Цвет</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((colorOpt) => (
            <button
              key={colorOpt.key}
              type="button"
              onClick={() => setFormData({ ...formData, color: colorOpt.key })}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                formData.color === colorOpt.key 
                  ? "border-primary scale-110 ring-2 ring-primary/30" 
                  : "border-border hover:scale-105"
              )}
              style={{ 
                background: colorOpt.color.startsWith("linear") 
                  ? colorOpt.color 
                  : colorOpt.color 
              }}
              title={colorOpt.label}
            />
          ))}
        </div>
      </div>

      {/* Ownership Status */}
      <div className="space-y-1.5">
        <Label className="font-body text-sm">Статус *</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={formData.ownershipStatus === "owned" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setFormData({ ...formData, ownershipStatus: "owned" })}
          >
            <Shirt className="w-4 h-4 mr-2" />
            Мой гардероб
          </Button>
          <Button
            type="button"
            variant={formData.ownershipStatus === "saved" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setFormData({ ...formData, ownershipStatus: "saved" })}
          >
            <Heart className="w-4 h-4 mr-2" />
            Сохранённое
          </Button>
        </div>
      </div>

      {/* Source URL - only for saved items */}
      {formData.ownershipStatus === "saved" && (
        <div className="space-y-1.5">
          <Label htmlFor="sourceUrl" className="font-body text-sm">
            Источник (ссылка)
          </Label>
          <Input
            id="sourceUrl"
            placeholder="https://pinterest.com/..."
            value={formData.sourceUrl}
            onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
          />
        </div>
      )}

      {/* Price */}
      <div className="space-y-1.5">
        <Label htmlFor="price" className="font-body text-sm">
          Цена (₽)
        </Label>
        <Input
          id="price"
          type="number"
          placeholder="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="font-body text-sm">
          Описание
        </Label>
        <Textarea
          id="description"
          placeholder="Дополнительные заметки..."
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={() => setUploadStep("preview")}
          disabled={uploading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button 
          className="flex-1" 
          onClick={handleSaveItem}
          disabled={uploading || !formData.name || !formData.category}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Сохранить
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div 
      ref={isMobile ? containerRef : undefined}
      className="relative min-h-screen bg-background overflow-auto"
    >
      {/* Pull to Refresh Indicator */}
      {isMobile && <PullToRefreshIndicator isRefreshing={isRefreshing} pullProgress={pullProgress} />}
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                  Мой гардероб
                </h1>
                <p className="font-body text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {loading ? "Загрузка..." : `${filteredItems.length} вещей`}
                </p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 h-9 sm:h-10 px-3 sm:px-4">
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Добавить</span>
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 sm:h-10"
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                <Filter className="w-4 h-4" />
              </Button>
              <div className="hidden sm:flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none h-10"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none h-10"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Ownership Tabs */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
              <Button
                variant={ownershipFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setOwnershipFilter("all")}
                className="shrink-0 text-xs sm:text-sm h-8 px-2.5 sm:px-3"
              >
                Все ({wardrobeItems.length})
              </Button>
              <Button
                variant={ownershipFilter === "owned" ? "default" : "outline"}
                size="sm"
                onClick={() => setOwnershipFilter("owned")}
                className="shrink-0 text-xs sm:text-sm h-8 px-2.5 sm:px-3"
              >
                <Shirt className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden xs:inline">Мой гардероб</span>
                <span className="xs:hidden">Мой</span>
                <span className="ml-1">({ownedCount})</span>
              </Button>
              <Button
                variant={ownershipFilter === "saved" ? "default" : "outline"}
                size="sm"
                onClick={() => setOwnershipFilter("saved")}
                className="shrink-0 text-xs sm:text-sm h-8 px-2.5 sm:px-3"
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden xs:inline">Сохранённое</span>
                <span className="xs:hidden">Идеи</span>
                <span className="ml-1">({savedCount})</span>
              </Button>
            </div>

            {/* Categories */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
              {categories.map((cat) => (
                <Button
                  key={cat.key}
                  variant={selectedCategory === cat.key ? "secondary" : "ghost"}
                  size="sm"
                  className="shrink-0 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
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
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Shirt className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
              {searchQuery || selectedCategory !== "all" ? "Ничего не найдено" : "Гардероб пуст"}
            </h3>
            <p className="font-body text-sm text-muted-foreground max-w-sm mb-6">
              {searchQuery || selectedCategory !== "all" 
                ? "Попробуйте изменить параметры поиска" 
                : "Добавьте первые вещи, чтобы начать создавать стильные образы"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Добавить вещь
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-2.5 sm:gap-4",
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                : "grid-cols-1"
            )}
          >
            {filteredItems.map((item) => (
              <ClothingCard
                key={item.id}
                image={item.image_url}
                brand={item.brand || ""}
                name={item.name}
                price={item.price ? `₽${item.price.toLocaleString()}` : ""}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {uploadStep === "select" && "Добавить вещь"}
              {uploadStep === "preview" && "Проверьте фото"}
              {uploadStep === "details" && "Детали вещи"}
            </DialogTitle>
            <DialogDescription className="font-body">
              {uploadStep === "select" && "Выберите способ добавления одежды"}
              {uploadStep === "preview" && "Убедитесь, что вещь хорошо видна"}
              {uploadStep === "details" && "Заполните информацию о вещи"}
            </DialogDescription>
          </DialogHeader>

          {uploadStep === "select" && renderUploadOptions()}
          {uploadStep === "preview" && renderPreviewStep()}
          {uploadStep === "details" && renderDetailsForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
