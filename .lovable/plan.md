
# План: Улучшить отображение результатов AI-стилиста

## Проблема

Когда AI не нашёл подходящих вещей (или нашёл только часть), UI показывает:
- Пустой грид вещей
- Общее объяснение "не удалось подобрать"
- Список пропущенных категорий

Нужно: **всегда показывать найденные вещи**, даже если образ неполный.

## Решение

### Два сценария отображения

```text
Сценарий 1: Найдено >= 1 вещь
├─ Показать грид с найденными вещами
├─ Показать предупреждение о пропущенных категориях (если есть)
├─ Показать объяснение + советы
└─ Кнопка "Попробовать снова"

Сценарий 2: Найдено 0 вещей
├─ Показать специальное состояние "Ничего не подошло"
├─ Показать список пропущенных категорий
├─ Рекомендация добавить больше вещей в гардероб
└─ Кнопка "Попробовать снова"
```

## Изменения

| Файл | Изменения |
|------|-----------|
| `src/components/dashboard/AIOutfitSuggestion.tsx` | Добавить условную логику рендеринга для двух сценариев |
| `src/i18n/locales/en.json` + `ru.json` | Добавить тексты для пустого результата |

## Технические детали

### Обновление компонента

```tsx
// Result state
return (
  <Card className="overflow-hidden">
    <CardContent className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <AIBadge text={t("platform.dashboard.aiStylist.badge")} />
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Если есть подобранные вещи — показываем грид */}
      {recommendation?.items && recommendation.items.length > 0 ? (
        <>
          {/* Missing categories warning (вверху) */}
          {hasWissingCategories && (
            <div className="bg-amber-50 ...">
              <AlertTriangle />
              <span>Некоторые категории не подобраны:</span>
              {missing_categories.map(...)}
            </div>
          )}

          {/* Items Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {recommendation.items.map((item) => (
              <div key={item.wardrobe_item_id}>
                <img src={getImageUrl(item.item)} alt={item.item.name} />
                <p>{item.item.name}</p>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <p>{recommendation.explanation}</p>

          {/* Style Tips */}
          {recommendation.style_tips?.length > 0 && (
            <div className="bg-accent/30 ...">
              <Lightbulb /> Советы по стилю
              <ul>...</ul>
            </div>
          )}
        </>
      ) : (
        // Если вещей НЕТ — показываем специальное состояние
        <div className="text-center py-4">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-display text-base font-semibold mb-2">
            {t("platform.dashboard.aiStylist.noSuitableItems")}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {recommendation?.explanation}
          </p>
          
          {/* Список того, чего не хватает */}
          {hasMissingCategories && (
            <div className="bg-muted/50 rounded-lg p-3 text-left mb-4">
              <p className="text-xs text-muted-foreground mb-2">
                {t("platform.dashboard.aiStylist.missingCategories")}:
              </p>
              <ul className="text-xs space-y-1">
                {missing_categories.map((m) => (
                  <li key={m.category}>• {m.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions (всегда) */}
      <Button variant="outline" onClick={fetchRecommendation}>
        <RefreshCw /> Попробовать снова
      </Button>
    </CardContent>
  </Card>
);
```

### Новые переводы

```json
{
  "platform": {
    "dashboard": {
      "aiStylist": {
        "noSuitableItems": "Подходящие вещи не найдены",
        "noSuitableItemsDesc": "В вашем гардеробе не нашлось вещей, подходящих для текущей погоды",
        "missingCategories": "Не удалось подобрать",
        "partialResult": "Образ неполный, но вот что подошло"
      }
    }
  }
}
```

## Порядок реализации

1. Добавить переводы в `en.json` и `ru.json`
2. Обновить логику рендеринга в `AIOutfitSuggestion.tsx`
3. Добавить адаптивную сетку (если 1-2 вещи — крупнее показать)
