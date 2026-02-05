

# План: Исправить загрузку из Pinterest

## Проблема

Edge Function `analyze-clothing-url` не работает, потому что:
- В `supabase/config.toml` отсутствует конфигурация для этой функции
- По умолчанию Supabase требует JWT-авторизацию для Edge Functions
- Хотя пользователь авторизован, функция может не получать правильный токен

## Решение

Добавить конфигурацию для `analyze-clothing-url` в `supabase/config.toml`:

```toml
project_id = "ujvxeqhfnvebpfhxvjlh"

[functions.ai-stylist]
verify_jwt = false

[functions.analyze-clothing-url]
verify_jwt = false
```

## Изменения

| Файл | Изменения |
|------|-----------|
| `supabase/config.toml` | Добавить секцию `[functions.analyze-clothing-url]` с `verify_jwt = false` |

## Почему это решит проблему

1. Сейчас функция требует JWT-токен, но может получать его в неправильном формате
2. После добавления `verify_jwt = false` функция будет доступна без проверки JWT
3. Это аналогично уже работающей функции `ai-stylist`

## Дополнительная отладка

Если проблема сохранится после изменения конфигурации, нужно:
1. Проверить логи Edge Function через `supabase--edge-function-logs`
2. Добавить дополнительное логирование в начало функции для отладки входящих запросов

