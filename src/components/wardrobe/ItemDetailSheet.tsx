import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  Pencil,
  Trash2,
  ArrowRightLeft,
  ExternalLink,
  X,
  Check,
  Loader2,
  Shirt,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  season?: string | null;
}

interface ItemDetailSheetProps {
  item: WardrobeItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: Partial<WardrobeItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleFavorite: (id: string, current: boolean) => Promise<void>;
}

const categoryOptions = [
  { key: "tops", label: "Верх" },
  { key: "bottoms", label: "Низ" },
  { key: "dresses", label: "Платья" },
  { key: "outerwear", label: "Верхняя одежда" },
  { key: "shoes", label: "Обувь" },
  { key: "accessories", label: "Аксессуары" },
];

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

const seasonOptions = [
  { key: "winter", label: "Зима", emoji: "❄️" },
  { key: "summer", label: "Лето", emoji: "☀️" },
  { key: "demi", label: "Демисезон", emoji: "🍂" },
  { key: "all", label: "Все сезоны", emoji: "🔄" },
];

const getCategoryLabel = (key: string) =>
  categoryOptions.find((c) => c.key === key)?.label || key;

const getColorInfo = (key: string | null) =>
  colorOptions.find((c) => c.key === key);

const getSeasonInfo = (key: string | null | undefined) =>
  seasonOptions.find((s) => s.key === key);

export function ItemDetailSheet({
  item,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onToggleFavorite,
}: ItemDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    brand: "",
    category: "",
    color: "",
    price: "",
    description: "",
    season: "",
  });

  // Reset edit state when item changes or sheet closes
  useEffect(() => {
    if (item) {
      setEditData({
        name: item.name,
        brand: item.brand || "",
        category: item.category,
        color: item.color || "",
        price: item.price != null ? String(item.price) : "",
        description: item.description || "",
        season: item.season || "",
      });
    }
    setIsEditing(false);
  }, [item, open]);

  if (!item) return null;

  const handleSave = async () => {
    if (!editData.name.trim() || !editData.category) return;
    setSaving(true);
    try {
      await onUpdate(item.id, {
        name: editData.name.trim(),
        brand: editData.brand.trim() || null,
        category: editData.category,
        color: editData.color || null,
        price: editData.price ? parseFloat(editData.price) : null,
        description: editData.description.trim() || null,
        season: editData.season || null,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(item.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async () => {
    const newStatus = item.ownership_status === "owned" ? "saved" : "owned";
    await onUpdate(item.id, { ownership_status: newStatus } as Partial<WardrobeItem>);
  };

  const colorInfo = getColorInfo(item.color);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
          <SheetTitle className="font-display text-lg">Детали вещи</SheetTitle>
          <button
            onClick={() => onToggleFavorite(item.id, item.is_favorite)}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all",
              item.is_favorite
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-primary"
            )}
          >
            <Heart className={cn("w-4 h-4", item.is_favorite && "fill-current")} />
          </button>
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* Image */}
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary/20">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* Status badge */}
            <div className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
              {item.ownership_status === "owned" ? (
                <>
                  <Shirt className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">Мой гардероб</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-xs font-medium">Сохранённое</span>
                </>
              )}
            </div>
          </div>

          {/* Details - View or Edit mode */}
          {isEditing ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="font-body text-sm">Название *</Label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Название вещи"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm">Бренд</Label>
                <Input
                  value={editData.brand}
                  onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                  placeholder="Бренд"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm">Категория *</Label>
                <Select
                  value={editData.category}
                  onValueChange={(v) => setEditData({ ...editData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.key} value={c.key}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm">Цвет</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setEditData({ ...editData, color: opt.key })}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        editData.color === opt.key
                          ? "border-primary scale-110 ring-2 ring-primary/30"
                          : "border-border hover:scale-105"
                      )}
                      style={{
                        background: opt.color.startsWith("linear")
                          ? opt.color
                          : opt.color,
                      }}
                      title={opt.label}
                    />
                  ))}
                </div>
              </div>

              {/* Season */}
              <div className="space-y-1.5">
                <Label className="font-body text-sm">Сезон</Label>
                <Select
                  value={editData.season}
                  onValueChange={(v) => setEditData({ ...editData, season: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Не указан" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonOptions.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.emoji} {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm">Цена (₽)</Label>
                <Input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm">Описание</Label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Дополнительные заметки..."
                  rows={2}
                />
              </div>

              {/* Edit actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      name: item.name,
                      brand: item.brand || "",
                      category: item.category,
                      color: item.color || "",
                      price: item.price != null ? String(item.price) : "",
                      description: item.description || "",
                      season: item.season || "",
                    });
                  }}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Отмена
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saving || !editData.name.trim() || !editData.category}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Сохранить
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Brand */}
              {item.brand && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Бренд
                  </p>
                  <p className="font-body text-sm font-medium text-foreground mt-0.5">
                    {item.brand}
                  </p>
                </div>
              )}

              {/* Name */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Название
                </p>
                <p className="font-body text-base font-semibold text-foreground mt-0.5">
                  {item.name}
                </p>
              </div>

              {/* Category */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Категория
                </p>
                <p className="font-body text-sm text-foreground mt-0.5">
                  {getCategoryLabel(item.category)}
                </p>
              </div>

              {/* Color */}
              {colorInfo && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Цвет
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-5 h-5 rounded-full border border-border"
                      style={{
                        background: colorInfo.color.startsWith("linear")
                          ? colorInfo.color
                          : colorInfo.color,
                      }}
                    />
                    <span className="font-body text-sm text-foreground">
                      {colorInfo.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Season */}
              {getSeasonInfo(item.season) && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Сезон
                  </p>
                  <p className="font-body text-sm text-foreground mt-0.5">
                    {getSeasonInfo(item.season)!.emoji} {getSeasonInfo(item.season)!.label}
                  </p>
                </div>
              )}

              {/* Price */}
              {item.price != null && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Цена
                  </p>
                  <p className="font-body text-sm font-semibold text-primary mt-0.5">
                    ₽{item.price.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Description */}
              {item.description && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Описание
                  </p>
                  <p className="font-body text-sm text-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Source URL */}
              {item.source_url && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Источник
                  </p>
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-body text-sm text-primary hover:underline mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {new URL(item.source_url).hostname.replace("www.", "")}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom actions (only in view mode) */}
        {!isEditing && (
          <div className="border-t border-border px-4 py-3 space-y-2">
            {/* Move button */}
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={handleMove}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              {item.ownership_status === "saved"
                ? "Переместить в Мой гардероб"
                : "Переместить в Сохранённое"}
            </Button>

            {/* Edit & Delete */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Редактировать
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex-1">
                    {deleting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Удалить
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить вещь?</AlertDialogTitle>
                    <AlertDialogDescription>
                      «{item.name}» будет удалена навсегда. Это действие нельзя отменить.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
