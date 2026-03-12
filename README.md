# GoNext — Дневник туриста (MVP)

Офлайн мобильное приложение на `Expo Router + TypeScript + React Native Paper`.

## Что реализовано в MVP

- Режим `Места`: список, создание, карточка, редактирование, фото, открытие на карте.
- Режим `Поездки`: список, создание, детали, маршрут, порядок, отметка посещения, заметки, фото.
- Режим `Следующее место`: выбор активной поездки и показ следующей точки маршрута.
- Все данные хранятся локально:
  - native: `SQLite` + локальная файловая система для фото;
  - web: fallback через `localStorage`.

## Технологии

- Expo SDK 55
- Expo Router
- React Native Paper
- SQLite (`expo-sqlite`)
- Image Picker (`expo-image-picker`)
- File System (`expo-file-system`)

## Быстрый запуск (PowerShell)

```powershell
npm install
npm run start -- --clear
```

## Команды проекта (PowerShell)

```powershell
# Запуск
npm run start
npm run android
npm run ios
npm run web

# Проверка типов
npm run typecheck

# Веб-сборка для демонстрации
npm run build:web
```

## Структура проекта

- `app/` — экраны и маршруты Expo Router.
- `src/components/` — переиспользуемые UI-компоненты.
- `src/database/` — инициализация БД, миграции, репозитории.
- `src/services/` — сервисы работы с локальными ресурсами (например, фото).
- `assets/` — изображения и статические ресурсы.

## Документы

- `PROJECT.md` — описание продукта и требований.
- `PLAN.md` — план этапов реализации.
- `TEST_STAGE8.md` — чек-лист ручного тестирования MVP.
- `MVP_RELEASE.md` — инструкция подготовки и демонстрации релизной версии.
