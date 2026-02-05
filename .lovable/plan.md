
# План: Тестовый AI-агент для рекомендаций одежды по погоде

## Обзор

Создаём AI-стилиста прямо на Dashboard, который анализирует текущую погоду и вещи из гардероба пользователя, чтобы предложить подходящий образ.

## Архитектура решения

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Dashboard     │────▶│  Edge Function   │────▶│  Lovable AI     │
│   (Frontend)    │     │  ai-stylist      │     │  (Gemini Flash) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│  Weather API    │     │   Supabase DB    │
│  (Open-Meteo)   │     │  wardrobe_items  │
└─────────────────┘     └──────────────────┘
```

## Что будем делать

### 1. Edge Function для AI-стилиста

Создаём `supabase/functions/ai-stylist/index.ts`:

- Принимает: данные о погоде + список вещей из гардероба
- Вызывает Lovable AI (google/gemini-3-flash-preview) через gateway
- Использует tool calling для структурированного ответа
- Возвращает: рекомендованный образ с объяснением

### 2. Кастомный хук useWeather

Создаём `src/hooks/useWeather.ts`:

- Получает геолокацию пользователя (или из профиля)
- Запрашивает погоду через Open-Meteo API (бесплатный, без ключа)
- Кэширует результат на 30 минут
- Возвращает температуру, условия, иконку

### 3. Компонент AI-рекомендации на Dashboard

Создаём `src/components/dashboard/AIOutfitSuggestion.tsx`:

- Кнопка "Подобрать образ" в Weather Card
- При клике: загружает гардероб + получает рекомендацию от AI
- Показывает карточки рекомендованных вещей
- Объяснение почему именно эти вещи подходят

### 4. Обновление Dashboard

Модифицируем `src/pages/platform/Dashboard.tsx`:

- Интегрируем реальную погоду вместо захардкоженных 12°C
- Добавляем секцию AI-рекомендации
- Показываем состояние загрузки и ошибки

### 5. Локализация

Добавляем переводы в `en.json` и `ru.json` для новых строк.

---

## Технические детали

### Edge Function: ai-stylist

```typescript
// Структура запроса
interface StylistRequest {
  weather: {
    temperature: number;
    condition: string; // sunny, cloudy, rainy, snowy
    humidity: number;
  };
  wardrobe: Array<{
    id: string;
    name: string;
    category: string;
    color: string | null;
    brand: string | null;
  }>;
  occasion?: string; // casual, business, evening
}

// Структура ответа через tool calling
interface OutfitRecommendation {
  items: Array<{
    wardrobe_item_id: string;
    reason: string;
  }>;
  explanation: string;
  style_tips: string[];
}
```

### Open-Meteo API (бесплатный)

```text
GET https://api.open-meteo.com/v1/forecast
  ?latitude=55.75
  &longitude=37.62
  &current=temperature_2m,weather_code,relative_humidity_2m
```

### UI Flow

1. Пользователь на Dashboard видит карточку погоды
2. Нажимает "Подобрать образ по погоде"
3. Показывается skeleton/loading
4. AI анализирует гардероб и погоду
5. Появляется карточка с 3-5 вещами + объяснение
6. Кнопки: "Сохранить как образ" / "Другой вариант"

---

## Файлы для создания/изменения

| Файл | Действие |
|------|----------|
| `supabase/functions/ai-stylist/index.ts` | Создать |
| `src/hooks/useWeather.ts` | Создать |
| `src/components/dashboard/AIOutfitSuggestion.tsx` | Создать |
| `src/pages/platform/Dashboard.tsx` | Изменить |
| `src/i18n/locales/ru.json` | Изменить |
| `src/i18n/locales/en.json` | Изменить |

---

## Ограничения тестовой версии

- Работает с mock-данными гардероба в dev-режиме
- Геолокация по умолчанию: Москва (можно сменить)
- Без сохранения рекомендаций в БД (пока)
- Простой промпт без учёта профиля пользователя
