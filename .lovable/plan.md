

# План: Кликабельные карточки вещей в результатах AI-подбора

## Проблема

Сейчас в результатах AI-стилиста вещи отображаются как простые картинки без интерактива. Пользователь не может нажать на вещь, чтобы посмотреть подробности (бренд, категорию, цвет, цену, описание и т.д.).

## Решение

Сделать карточки вещей в `AIOutfitSuggestion` кликабельными. При нажатии на вещь — открывать `ItemDetailSheet` (уже реализован для страницы Гардероба) с полной информацией о вещи.

## Ключевая сложность

AI-стилист получает только часть данных вещи (id, name, category, color, brand, image_url, season). Для `ItemDetailSheet` нужны дополнительные поля: `ownership_status`, `is_favorite`, `price`, `description`, `source_url`, `subcategory`. При клике на карточку нужно подгрузить полные данные из базы.

## Изменения по файлам

| Файл | Что делаем |
|------|-----------|
| `src/components/dashboard/AIOutfitSuggestion.tsx` | Добавить `ItemDetailSheet`, состояние выбранной вещи, подгрузку полных данных по клику, обработчики update/delete/toggleFavorite |

## Технические детали

### 1. Добавить состояние и импорты

```typescript
import { ItemDetailSheet } from "@/components/wardrobe/ItemDetailSheet";

// Полный тип для Sheet
interface FullWardrobeItem {
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

const [selectedItem, setSelectedItem] = useState<FullWardrobeItem | null>(null);
const [isDetailOpen, setIsDetailOpen] = useState(false);
```

### 2. Подгрузка полных данных при клике

```typescript
const handleItemClick = async (itemId: string) => {
  // Загрузить полные данные вещи из базы
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("id", itemId)
    .single();
  
  if (data && !error) {
    setSelectedItem(data);
    setIsDetailOpen(true);
  }
};
```

### 3. Сделать карточки кликабельными

Заменить обычные `div` на кликабельные элементы с визуальным фидбэком (курсор, hover-эффект):

```typescript
<div 
  key={item.wardrobe_item_id} 
  className="relative group cursor-pointer"
  onClick={() => handleItemClick(item.wardrobe_item_id)}
>
  <div className="aspect-square rounded-lg overflow-hidden bg-muted ring-0 hover:ring-2 hover:ring-primary/50 transition-all">
    ...
  </div>
</div>
```

### 4. Обработчики для Sheet

Добавить обработчики update, delete, toggleFavorite (аналогично странице Wardrobe), чтобы пользователь мог редактировать и управлять вещью прямо из результатов подбора.

### 5. Рендер ItemDetailSheet

```typescript
<ItemDetailSheet
  item={selectedItem}
  open={isDetailOpen}
  onOpenChange={setIsDetailOpen}
  onUpdate={handleUpdateItem}
  onDelete={handleDeleteItem}
  onToggleFavorite={handleToggleFavorite}
/>
```

## Результат

- Пользователь видит результаты подбора AI
- Нажимает на любую вещь из образа
- Открывается боковая панель с полной информацией
- Можно редактировать, перемещать между категориями, удалять -- прямо из результатов подбора

