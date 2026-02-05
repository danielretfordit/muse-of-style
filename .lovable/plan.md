

# План: Итеративный AI-стилист с анимацией и учётом отсутствия сезонности

## Проблема

1. AI анализирует все вещи разом → путает обувь, пропускает тёплые ботинки
2. Пользователь не видит прогресс анализа
3. **Сезонность (`season`) может быть НЕ указана** у большинства вещей

## Решение

### Логика предфильтрации с учётом отсутствия сезонности

```text
Для каждой вещи:
├─ season УКАЗАНА?
│   ├─ Да → Фильтруем по правилам (winter при +25°C = исключить)
│   └─ Нет → ОТПРАВЛЯЕМ на визуальный анализ AI
```

То есть:
- `season = "summer"` + температура < +5°C → **исключить** (не отправлять AI)
- `season = "winter"` + температура > +25°C → **исключить**
- `season = null/undefined` → **отправить AI** для визуального анализа

### Архитектура

```text
┌─────────────────────────────────────────────────────────┐
│  ЭТАП 1: Предфильтрация (клиент)                        │
│  ─────────────────────────────────────────              │
│  Убираем ТОЛЬКО те вещи, где season явно противоречит   │
│  погоде. Вещи без season → пропускаем дальше            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ЭТАП 2: Итеративный анализ по категориям               │
│  ─────────────────────────────────────────              │
│  → Обувь (до 5 шт) → AI выбирает 1 подходящую           │
│  → Верхняя одежда → AI выбирает 1                       │
│  → Верх (топы) → AI выбирает 1-2                        │
│  → Низ → AI выбирает 1                                  │
│  → Аксессуары → опционально                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ЭТАП 3: Финальная сборка + советы                      │
└─────────────────────────────────────────────────────────┘
```

## Изменения в файлах

| Файл | Изменения |
|------|-----------|
| `wardrobe_items` (миграция) | Добавить поле `season` (nullable) |
| `supabase/functions/ai-stylist/index.ts` | Итеративный анализ по категориям |
| `src/components/dashboard/AIOutfitSuggestion.tsx` | Анимация + статусы этапов |
| `src/i18n/locales/en.json` + `ru.json` | Переводы для статусов |

## Технические детали

### 1. Миграция: добавить поле season (nullable!)

```sql
ALTER TABLE wardrobe_items 
ADD COLUMN season TEXT 
CHECK (season IN ('winter', 'summer', 'demi', 'all'));

COMMENT ON COLUMN wardrobe_items.season IS 
  'Сезонность: winter, summer, demi (демисезон), all (универсальная). NULL = не указано, определяется AI визуально';
```

### 2. Предфильтрация на клиенте

```typescript
function prefilterByWeather(
  items: WardrobeItem[], 
  temperature: number
): WardrobeItem[] {
  return items.filter(item => {
    // Если season НЕ указана — пропускаем на AI анализ
    if (!item.season) return true;
    
    // Если season указана — применяем правила
    if (temperature < 5 && item.season === 'summer') return false;
    if (temperature > 25 && item.season === 'winter') return false;
    
    return true;
  });
}
```

### 3. Новый формат запроса к Edge Function

```typescript
interface StylistRequest {
  weather: { temperature: number; condition: string; humidity: number };
  wardrobe: WardrobeItemWithSeason[];
  categories_to_analyze: string[];  // ["shoes", "outerwear", "tops", "bottoms"]
  language: string;
}

interface WardrobeItemWithSeason extends WardrobeItem {
  season?: 'winter' | 'summer' | 'demi' | 'all' | null;
}
```

### 4. Итеративный анализ в Edge Function

```typescript
const CATEGORIES = [
  { key: 'shoes', maxItems: 5, required: true },
  { key: 'outerwear', maxItems: 4, required: temperature < 15 },
  { key: 'tops', maxItems: 5, required: true },
  { key: 'bottoms', maxItems: 4, required: true },
  { key: 'accessories', maxItems: 3, required: false },
];

const results: SelectedItem[] = [];

for (const category of CATEGORIES) {
  const categoryItems = wardrobe.filter(i => i.category === category.key);
  
  if (categoryItems.length === 0) {
    if (category.required) {
      results.push({ 
        category: category.key, 
        missing: true,
        message: `Нет ${category.key} в гардеробе` 
      });
    }
    continue;
  }
  
  // Анализируем только эту категорию (до maxItems)
  const bestItem = await analyzeCategoryWithAI(
    weather, 
    categoryItems.slice(0, category.maxItems),
    language
  );
  
  if (bestItem) results.push(bestItem);
}
```

### 5. Компонент анимации прогресса

```tsx
interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'done' | 'skipped' | 'missing';
  result?: string;  // "Зимние ботинки" или "Не найдено"
}

function AnalysisProgress({ steps, progress }: { steps: AnalysisStep[]; progress: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <span className="font-display text-lg">Подбираю образ...</span>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        <div className="space-y-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2 text-sm">
              {step.status === 'done' && <Check className="w-4 h-4 text-green-500" />}
              {step.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
              {step.status === 'pending' && <Circle className="w-4 h-4 text-muted" />}
              {step.status === 'missing' && <AlertCircle className="w-4 h-4 text-amber-500" />}
              
              <span className={step.status === 'processing' ? 'font-medium' : ''}>
                {step.label}
              </span>
              
              {step.result && (
                <span className="ml-auto text-muted-foreground text-xs">
                  {step.result}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 6. Обновлённый промпт для категории

```typescript
const categoryPrompt = (category: string, weather: Weather, language: string) => 
  language === 'ru'
    ? `Ты анализируешь ТОЛЬКО категорию "${category}".

Погода: ${weather.temperature}°C, ${weather.condition}

ЗАДАЧА: Из представленных вещей выбери ОДНУ, которая лучше всего подходит для этой погоды.
Внимательно смотри на ФОТО каждой вещи и оценивай визуально:
- Материал и плотность
- Тип (открытая/закрытая обувь, тёплый/лёгкий верх)

Если НИ ОДНА вещь не подходит для погоды — верни пустой результат.
Лучше ничего не выбрать, чем выбрать неподходящее!`
    : `You are analyzing ONLY the "${category}" category.
...`;
```

## Порядок реализации

1. **Миграция БД** — добавить поле `season` (nullable)
2. **Edge Function** — переделать на поэтапный анализ по категориям
3. **Frontend компонент** — добавить `AnalysisProgress` с анимацией
4. **Интеграция** — связать состояния и отображение
5. **Переводы** — добавить тексты для этапов

