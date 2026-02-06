

# План: Включить все вещи гардероба в анализ AI-стилиста

## Проблема

AI-стилист фильтрует вещи по `ownership_status = "owned"`, поэтому "сохранённые" вещи (например, зимняя парка) не попадают в анализ. AI видит только 3 из 5 вещей.

Текущий запрос в `AIOutfitSuggestion.tsx` (строка 181):
```typescript
.eq("ownership_status", "owned")
```

## Решение

Убрать фильтр `ownership_status`, чтобы AI анализировал ВСЕ вещи из гардероба -- и "мои", и "сохранённые". Это логично, потому что пользователь видит все вещи в одном месте и ожидает, что AI учтёт их все.

## Изменения

| Файл | Что меняем |
|------|-----------|
| `src/components/dashboard/AIOutfitSuggestion.tsx` | Убрать `.eq("ownership_status", "owned")` из запроса к базе данных |

## Технические детали

Строка 181 -- убираем фильтр:

```typescript
// Было:
const { data, error: fetchError } = await supabase
  .from("wardrobe_items")
  .select("id, name, category, color, brand, image_url, season")
  .eq("user_id", user.id)
  .eq("ownership_status", "owned");  // <-- эта строка исключает парку

// Станет:
const { data, error: fetchError } = await supabase
  .from("wardrobe_items")
  .select("id, name, category, color, brand, image_url, season")
  .eq("user_id", user.id);
```

## Результат

После изменения AI получит все 5 вещей:
- Обувь: Ботинки, Трекинговые ботинки, кеды (3 шт.)
- Верхняя одежда: Зимняя парка (1 шт.)
- Верх: Тест/худи (1 шт.)

AI сможет подобрать полный образ, включая зимнюю парку для погоды -17 градусов.

