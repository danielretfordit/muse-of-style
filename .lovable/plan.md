

# План: Полноценные карточки вещей в гардеробе

## Текущее состояние

Сейчас `ClothingCard` — простой компонент без интерактива:
- Показывает только фото, бренд, название, цену
- Нет возможности просмотреть детали вещи
- Нет редактирования
- Нет перемещения между "Мой гардероб" и "Сохранённое"
- Кнопка "Сердечко" — декоративная (не связана с `is_favorite` в базе)

## Что будет реализовано

1. **Просмотр карточки** — нажатие на карточку открывает детальный вид с большим фото и всей информацией
2. **Редактирование** — из детального вида можно редактировать все поля (название, бренд, категория, цвет, цена, описание)
3. **Перемещение** — кнопка "Переместить в Мой гардероб" / "Переместить в Сохранённое"
4. **Избранное** — кнопка-сердечко сохраняет `is_favorite` в базу данных
5. **Удаление** — возможность удалить вещь с подтверждением

## Изменения по файлам

| Файл | Что делаем |
|------|-----------|
| `src/components/ui/clothing-card.tsx` | Расширяем пропсы: добавляем `onClick`, `isFavorite`, `onFavoriteToggle`, `ownershipStatus`, визуальный индикатор статуса |
| `src/components/wardrobe/ItemDetailSheet.tsx` | **Новый файл** — Sheet (выдвижная панель) с детальным просмотром, редактированием, перемещением, удалением |
| `src/pages/platform/Wardrobe.tsx` | Подключаем Sheet, передаём обработчики в карточки, добавляем функции update/delete/toggle favorite |

## Технические детали

### 1. Обновление `ClothingCard`

Добавляем новые пропсы:

```typescript
interface ClothingCardProps {
  image: string;
  brand: string;
  name: string;
  price: string;
  className?: string;
  isFavorite?: boolean;
  ownershipStatus?: "owned" | "saved";
  onFavoriteToggle?: () => void;
  onClick?: () => void;
}
```

- Клик по карточке вызывает `onClick` (открывает детальный вид)
- Сердечко вызывает `onFavoriteToggle` (сохраняет в базу)
- Бейдж "Сохранённое" / иконка закладки для saved-вещей

### 2. Новый компонент `ItemDetailSheet`

Выдвижная панель (Sheet) с разделами:

- **Просмотр**: большое фото, бренд, название, категория, цвет, цена, описание, источник
- **Действия**:
  - "Переместить в Мой гардероб" (для saved) / "Переместить в Сохранённое" (для owned) -- обновляет `ownership_status` в базе
  - "Редактировать" — переключает в режим редактирования (все поля становятся Input/Select)
  - "Удалить" — с диалогом подтверждения
- **Избранное**: кнопка-сердечко в заголовке

Пропсы компонента:

```typescript
interface ItemDetailSheetProps {
  item: WardrobeItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: Partial<WardrobeItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleFavorite: (id: string, current: boolean) => Promise<void>;
}
```

### 3. Обновление `Wardrobe.tsx`

Новые функции:

```typescript
// Обновление вещи
const handleUpdateItem = async (id: string, updates: Partial<WardrobeItem>) => {
  await supabase.from("wardrobe_items").update(updates).eq("id", id);
  fetchItems();
};

// Удаление вещи (+ удаление файла из хранилища)
const handleDeleteItem = async (id: string) => {
  const item = wardrobeItems.find(i => i.id === id);
  // Удалить файл из storage
  // Удалить запись из базы
  await supabase.from("wardrobe_items").delete().eq("id", id);
  fetchItems();
};

// Переключение избранного
const handleToggleFavorite = async (id: string, current: boolean) => {
  await supabase.from("wardrobe_items")
    .update({ is_favorite: !current })
    .eq("id", id);
  // Оптимистичное обновление UI
};
```

Новое состояние:
```typescript
const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
const [isDetailOpen, setIsDetailOpen] = useState(false);
```

### Структура `ItemDetailSheet`

```text
+-----------------------------+
|  [X]              [Heart]   |
|                             |
|  +---------------------+   |
|  |                     |   |
|  |    Большое фото     |   |
|  |    (aspect 3:4)     |   |
|  |                     |   |
|  +---------------------+   |
|                             |
|  Бренд: Max Mara           |
|  Название: Кашемировый...  |
|  Категория: Верх            |
|  Цвет: ●  Бежевый          |
|  Цена: ₽45,900             |
|  Описание: ...              |
|  Источник: pinterest.com    |
|                             |
|  [Переместить в Мой гард.] |
|  [Редактировать]  [Удалить] |
+-----------------------------+
```

В режиме редактирования поля заменяются на Input/Select (переиспользуем те же компоненты, что в форме добавления).

## Порядок реализации

1. Обновить `ClothingCard` -- добавить новые пропсы и визуальные индикаторы
2. Создать `ItemDetailSheet` -- просмотр, редактирование, перемещение, удаление
3. Обновить `Wardrobe.tsx` -- подключить всё вместе, добавить обработчики базы данных
4. Протестировать на мобильном и десктопе

