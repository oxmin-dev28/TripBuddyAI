# 🚀 Как запустить TripBuddy AI

## Выбери режим запуска:

---

## 1️⃣ 🧪 DEMO режим (без Google Places API)

**Для быстрого тестирования UI без настройки API**

### Backend:
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run dev
```

✅ Backend запустится с **моками** (53 места Парижа)

### Mobile App:
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
npx expo start
```

📱 Отсканируй QR-код в Expo Go

**Ограничения:**
- ⚠️ Только места Парижа (моки)
- ⚠️ Нет реальных данных из Google

---

## 2️⃣ ⚡ PRODUCTION режим (с Google Places API)

**Для работы с реальными данными всех городов мира**

### Шаг 1: Получить Google Places API ключ

Следуй инструкции: [backend/GOOGLE_PLACES_SETUP.md](./backend/GOOGLE_PLACES_SETUP.md)

Кратко:
1. Открой [Google Cloud Console](https://console.cloud.google.com/)
2. Создай проект **TripBuddyAI**
3. Включи **Places API** в библиотеке
4. Создай **API ключ** в Credentials
5. Привяжи карту в Billing (получишь $200/месяц бесплатно)

### Шаг 2: Настроить Backend

```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend

# Создать .env файл
cp .env.example .env

# Открыть в редакторе
nano .env
```

**Вставить свой ключ:**
```env
GOOGLE_PLACES_API_KEY=AIzaSyB_твой_реальный_ключ_здесь
OPENAI_API_KEY=sk-proj-...  # опционально
PORT=3001
NODE_ENV=development
```

Сохранить: `Ctrl+X`, затем `Y`, затем `Enter`

### Шаг 3: Запустить Backend

```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run dev
```

Должен увидеть:
```
✅ [GooglePlaces] API working! Found 20 places
🚀 Server running on port 3001
```

### Шаг 4: Запустить Mobile App

```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
npx expo start
```

📱 Отсканируй QR-код в Expo Go

**Преимущества:**
- ✅ Реальные места из Google
- ✅ Работает для ЛЮБОГО города мира
- ✅ Неограниченное количество мест
- ✅ Актуальные данные о времени работы

---

## 3️⃣ 🌐 Запуск на удалённом сервере

**Для доступа из интернета (прода)**

Следуй инструкции: [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md)

Кратко:
1. Арендуй VPS (DigitalOcean, AWS, Hetzner)
2. Установи Node.js 18+ и PM2
3. Склонируй репозиторий
4. Настрой `.env` с Google Places API ключом
5. Запусти через PM2:
   ```bash
   cd backend
   npm install --production
   npm run build
   pm2 start dist/server.js --name tripbuddy-backend
   ```
6. Настрой Nginx + SSL
7. В мобильном приложении укажи URL сервера

---

## 🔍 Проверка работы

### Backend API:
```bash
# Статус сервисов
curl http://localhost:3001/api/status

# Поиск ресторанов в Париже
curl "http://localhost:3001/api/places/search?lat=48.8566&lng=2.3522&type=restaurant"

# Поиск музеев в Риме
curl "http://localhost:3001/api/places/search?lat=41.9028&lng=12.4964&type=museum"
```

### Mobile App:
1. Открой приложение в Expo Go
2. Пройди онбординг
3. На главном экране проверь:
   - ✅ Отображается твоя локация
   - ✅ Показывается статус Google Places
4. Нажми "Исследовать карту":
   - ✅ Загружаются места
   - ✅ Работают фильтры

---

## 🚨 Troubleshooting

### ❌ Backend не запускается

**Ошибка:** `Port 3001 already in use`

**Решение:**
```bash
# Убить процесс на порту 3001
lsof -ti:3001 | xargs kill -9

# Перезапустить
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run dev
```

---

### ❌ "PERMISSION_DENIED" от Google Places

**Причина:** Places API не включен

**Решение:**
1. Открой [Google Cloud Console](https://console.cloud.google.com/)
2. Перейди в **APIs & Services** → **Library**
3. Найди **Places API** и нажми **Enable**
4. Перезапусти backend

---

### ❌ "REQUEST_DENIED - billing not enabled"

**Причина:** Не привязана карта

**Решение:**
1. В Google Cloud Console → **Billing**
2. Нажми **Link a billing account**
3. Добавь карту (списаний не будет, $200/месяц бесплатно)
4. Перезапусти backend

---

### ❌ "Network request failed" в приложении

**Причина:** Backend недоступен или неправильный URL

**Решение:**

1. **Проверь, что backend запущен:**
   ```bash
   curl http://localhost:3001/api/status
   ```

2. **Если на физическом устройстве:**
   - ✅ Телефон в той же Wi-Fi сети?
   - ✅ Firewall не блокирует порт 3001?
   
3. **Если всё равно не работает:**
   ```bash
   # Перезапусти Expo с очисткой кэша
   npx expo start --clear
   ```

---

### ❌ Expo не показывает QR-код

**Решение:**
```bash
# Очистить кэш и перезапустить
npx expo start --clear

# Или использовать tunnel (медленнее, но работает через любую сеть)
npx expo start --tunnel
```

---

### ❌ Показывает только моки Парижа (хотя есть API ключ)

**Причина:** Backend не видит `.env` файл

**Решение:**
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend

# Проверь, что .env существует
ls -la .env

# Если нет — создай
cp .env.example .env
nano .env  # Добавь свой ключ

# Перезапусти backend
npm run dev
```

Должен увидеть в логах:
```
✅ [GooglePlaces] API working! Found 20 places
```

---

## 📊 Проверка Google Places API в логах

При запуске backend смотри на логи:

### ✅ Работает правильно:
```
🌐 [GooglePlaces] Calling Google Places API...
✅ [GooglePlaces] Returning 42 real places from API
```

### ⚠️ Demo режим (нет ключа):
```
⚠️ [GooglePlaces] No API key, using Paris mock data (53 places)
✅ [GooglePlaces] Returning 53 mock places for type: restaurant
```

### ❌ Ошибка API:
```
❌ [GooglePlaces] API Error: PERMISSION_DENIED
⚠️ [GooglePlaces] Falling back to mock data
```

---

## 💡 Полезные команды

### Перезапустить всё:
```bash
# Убить все процессы
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null

# Терминал 1: Backend
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend && npm run dev

# Терминал 2: Mobile App
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI && npx expo start --clear
```

### Проверить TypeScript:
```bash
# Frontend
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
npx tsc --noEmit

# Backend
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run check
```

### Посмотреть логи только Google Places:
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run dev | grep GooglePlaces
```

---

## ✅ Checklist перед первым запуском

### Demo режим:
- [ ] Node.js установлен
- [ ] `npm install` выполнен в корне и в `backend/`
- [ ] Expo Go установлен на телефоне
- [ ] Backend запущен (`npm run dev`)
- [ ] Expo запущен (`npx expo start`)

### Production режим:
- [ ] Node.js установлен
- [ ] `npm install` выполнен
- [ ] Google Places API ключ получен
- [ ] `.env` файл создан в `backend/`
- [ ] API ключ добавлен в `.env`
- [ ] Backend запущен и показывает "API working"
- [ ] Expo Go установлен
- [ ] Expo запущен

---

## 🎯 Рекомендации

### Для разработки:
- ✅ Используй **Production режим** с реальным API
- ✅ Demo режим только для UI тестов без интернета

### Для продакшна:
- ✅ Деплой на VPS (читай [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md))
- ✅ Настрой Nginx + SSL
- ✅ Используй PM2 для автозапуска
- ✅ Ограничь API ключ по IP в Google Cloud Console

---

## 🆘 Если ничего не помогло

1. **Проверь логи backend:**
   ```bash
   cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
   npm run dev
   ```
   
2. **Проверь статус вручную:**
   ```bash
   curl http://localhost:3001/api/status
   ```
   
3. **Открой issue на GitHub:**
   - Опиши проблему
   - Приложи логи
   - Укажи ОС и версию Node.js

---

## 🎉 Всё работает!

Теперь можно:
- 🗺️ Исследовать места на карте
- 🤖 Генерировать маршруты через AI
- 🗳️ Голосовать за места с друзьями
- 📊 Смотреть статистику в профиле

**Приятных путешествий! 🌍✈️**

