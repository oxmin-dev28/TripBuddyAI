# 🚀 TripBuddy AI - Backend Server

Backend сервер для приложения TripBuddy AI с интеграцией Google Places API и OpenAI.

---

## ⚙️ Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения

Скопируй `.env.example` в `.env`:
```bash
cp .env.example .env
```

Открой `.env` и заполни:
```env
GOOGLE_PLACES_API_KEY=твой_ключ_google_places
OPENAI_API_KEY=твой_ключ_openai  # опционально
PORT=3001
NODE_ENV=development
```

**Как получить Google Places API ключ?** → Читай [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md)

### 3. Запуск в режиме разработки
```bash
npm run dev
```

Backend запустится на `http://localhost:3001`

### 4. Проверка работы
Открой в браузере:
```
http://localhost:3001/api/status
```

Должен увидеть:
```json
{
  "status": "ok",
  "google_places": {
    "working": true,
    "message": "API working! Found 20 places"
  },
  "openai": {
    "working": true,
    "message": "API key configured"
  }
}
```

---

## 🗺️ Режимы работы

### Demo режим (без API ключа)
Если в `.env` нет `GOOGLE_PLACES_API_KEY`:
- ✅ Backend запускается нормально
- ⚠️ Используются моки (53 места Парижа)
- 📍 Подходит для UI тестирования

### Production режим (с API ключом)
Если в `.env` есть `GOOGLE_PLACES_API_KEY`:
- ✅ Реальные данные из Google Places
- 🌍 Работает для **любого города** мира
- 🔥 Неограниченное количество мест

---

## 📁 Структура проекта

```
backend/
├── src/
│   ├── config/         # Конфигурация (dotenv)
│   ├── data/           # Моки для demo режима
│   ├── routes/         # API endpoints
│   ├── services/       # Google Places, OpenAI
│   ├── types/          # TypeScript типы
│   ├── utils/          # Утилиты (opening hours и др.)
│   └── server.ts       # Главный файл
├── dist/               # Скомпилированный JS (после npm run build)
├── .env                # Переменные окружения (не коммитить!)
├── .env.example        # Пример .env
└── package.json
```

---

## 🛠️ Доступные команды

```bash
npm run dev          # Запуск в режиме разработки (nodemon + watch)
npm run build        # Сборка TypeScript → JavaScript
npm start            # Запуск production версии (после build)
npm run clean        # Очистка dist/
npm run check        # Проверка TypeScript без компиляции
```

---

## 🌐 API Endpoints

### Статус сервисов
```
GET /api/status
```

### Поиск мест
```
GET /api/places/search?lat=48.8566&lng=2.3522&type=restaurant&budget=$$
```

Параметры:
- `lat`, `lng` — координаты (обязательно)
- `type` — тип места: `restaurant`, `cafe`, `museum`, `attraction`, `park`, etc.
- `budget` — бюджет: `$`, `$$`, `$$$`, `$$$$`
- `cuisines` — кухни через запятую: `french,italian`
- `interests` — интересы через запятую: `culture,food`
- `time` — время для проверки работы (ISO 8601): `2025-12-13T19:00:00Z`
- `openOnly` — только открытые места: `true`

### Генерация маршрута (AI)
```
POST /api/plan/generate
Content-Type: application/json

{
  "destination": "Paris",
  "days": 3,
  "budget": "$$",
  "interests": ["culture", "food"],
  "cuisines": ["french", "italian"]
}
```

### Голосование
```
POST /api/voting/vote
Content-Type: application/json

{
  "dayId": "day-1",
  "timeSlot": "morning",
  "placeId": "place-123",
  "userId": "user-456"
}
```

---

## 🔧 Настройка Google Places API

### Требуется для production!

1. **Создай проект** в [Google Cloud Console](https://console.cloud.google.com/)
2. **Включи Places API** в библиотеке
3. **Создай API ключ** в Credentials
4. **Добавь в .env:**
   ```env
   GOOGLE_PLACES_API_KEY=AIzaSyB...
   ```

Подробная инструкция: [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md)

**Важно:** Google Places API требует привязать карту, но даёт **$200/месяц бесплатно**!

---

## 🚀 Запуск на продакшен сервере

Читай подробную инструкцию: [PRODUCTION_DEPLOY.md](../PRODUCTION_DEPLOY.md)

Краткая версия:
```bash
# На сервере
npm install --production
npm run build
pm2 start dist/server.js --name tripbuddy-backend
```

---

## 🐛 Отладка

### Логирование
В коде используются префиксы для логов:
- `[GooglePlaces]` — запросы к Google Places API
- `[OpenAI]` — генерация маршрутов через AI
- `[Routes]` — обработка HTTP запросов

Пример:
```
🔍 [GooglePlaces] searchNearbyPlaces called: Paris (48.8566, 2.3522)
🌐 [GooglePlaces] Calling Google Places API...
✅ [GooglePlaces] Returning 42 real places from API
```

### Проверка API вручную
```bash
# Проверить статус
curl http://localhost:3001/api/status

# Поиск ресторанов в Париже
curl "http://localhost:3001/api/places/search?lat=48.8566&lng=2.3522&type=restaurant"

# Поиск музеев в Риме
curl "http://localhost:3001/api/places/search?lat=41.9028&lng=12.4964&type=museum"

# Только открытые места (текущее время)
curl "http://localhost:3001/api/places/search?lat=48.8566&lng=2.3522&type=restaurant&openOnly=true"
```

---

## 🔒 Безопасность

### ⚠️ НИКОГДА не коммить:
- ❌ `.env` файл
- ❌ API ключи
- ❌ Секреты

### ✅ Добавлено в .gitignore:
```
.env
.env.local
.env.*.local
node_modules/
dist/
```

### Рекомендации:
1. Используй разные ключи для dev и prod
2. Ограничь Google API ключ по IP в production
3. Включи rate limiting для API endpoints
4. Используй HTTPS в production

---

## 📊 Мониторинг

### Google Places API
- Лимиты: **100,000 запросов/месяц** бесплатно
- Мониторинг: [Google Cloud Console → APIs & Services](https://console.cloud.google.com/)

### Логи сервера
```bash
# В dev режиме — в консоли
npm run dev

# В production — через PM2
pm2 logs tripbuddy-backend
```

---

## 🆘 Частые проблемы

### `PERMISSION_DENIED` от Google Places
→ Включи Places API в Google Cloud Console

### `REQUEST_DENIED - billing not enabled`
→ Привяжи карту в Billing (получишь $200/месяц бесплатно)

### `Port 3001 already in use`
```bash
# Убить процесс на порту 3001
lsof -ti:3001 | xargs kill -9
```

### TypeScript ошибки
```bash
# Проверить типы
npm run check

# Пересобрать
npm run clean && npm run build
```

---

## 🎯 Технологии

- **Node.js** — runtime
- **Express** — web framework
- **TypeScript** — типизация
- **Google Places API** — поиск мест
- **OpenAI API** — AI генерация маршрутов
- **Nodemon** — hot reload в dev режиме
- **PM2** — process manager для production

---

## 📝 TODO

- [ ] Добавить PostgreSQL для персистентности
- [ ] Кэширование результатов Places API
- [ ] Rate limiting для API
- [ ] Websockets для real-time голосования
- [ ] Тесты (Jest)
- [ ] CI/CD pipeline
- [ ] Docker контейнеризация

---

## ✅ Готово к работе!

```bash
# Терминал 1: Backend
cd backend && npm run dev

# Терминал 2: Mobile App
cd .. && npx expo start
```

Сервер готов принимать запросы на `http://localhost:3001` 🚀

