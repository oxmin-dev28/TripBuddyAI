# 🚀 Команды для запуска TripBuddy AI

## ✅ Быстрый старт

### Автоматический запуск (один скрипт):
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
./start-app.sh
```

---

## 📱 Ручной запуск (два терминала)

### Терминал 1 — Backend:
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run dev
```

Ожидаемый вывод:
```
============================================================
🚀 TripBuddy API Server
============================================================
📦 Environment: DEVELOPMENT
🔌 Port: 3001

🔧 Services:
   ✅ OpenAI API (READY)
   ✅ Google Places API (READY)
   ❌ Database (In-memory)

✨ Production mode: All APIs configured!
```

### Терминал 2 — Expo:
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
npx expo start
```

Затем:
- Нажми **`s`** → переключить на Expo Go
- Нажми **`a`** → Android эмулятор
- Нажми **`i`** → iOS симулятор
- Отсканируй **QR-код** → Expo Go на телефоне
- Нажми **`w`** → открыть в браузере

---

## 🧪 Проверка API

### Проверить статус:
```bash
curl http://localhost:3001/api/status | python3 -m json.tool
```

### Тест Google Places - Париж (все типы):
```bash
curl "http://localhost:3001/api/places?lat=48.8566&lng=2.3522&type=all" | python3 -m json.tool
# Должно вернуть ~320+ мест (рестораны, кафе, музеи, парки, шопинг, достопримечательности)
```

### Тест Google Places - Париж (рестораны):
```bash
curl "http://localhost:3001/api/places?lat=48.8566&lng=2.3522&type=restaurant" | python3 -m json.tool
# Вернёт ~60 ресторанов (3 страницы по 20)
```

### Тест Google Places - Рим:
```bash
curl "http://localhost:3001/api/places?lat=41.9028&lng=12.4964&type=attraction" | python3 -m json.tool
```

### Тест Google Places - Барселона:
```bash
curl "http://localhost:3001/api/places?lat=41.3851&lng=2.1734&type=cafe" | python3 -m json.tool
```

### Тест Google Places - Лондон:
```bash
curl "http://localhost:3001/api/places?lat=51.5074&lng=-0.1278&type=museum" | python3 -m json.tool
```

---

## 🛑 Остановка

### Остановить backend:
```bash
pkill -f "nodemon.*backend"
# или
lsof -ti:3001 | xargs kill -9
```

### Остановить Expo:
```bash
pkill -f "expo start"
# или
lsof -ti:8081 | xargs kill -9
```

### Остановить всё:
```bash
pkill -f "nodemon.*backend" && pkill -f "expo start"
```

---

## 🔄 Перезапуск

### Перезапустить backend:
```bash
lsof -ti:3001 | xargs kill -9
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run dev
```

### Перезапустить Expo (очистка кэша):
```bash
lsof -ti:8081 | xargs kill -9
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
npx expo start --clear
```

---

## 🏗️ Build & Компиляция

### TypeScript проверка (backend):
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run build
```

### TypeScript проверка (frontend):
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
npx tsc --noEmit
```

### Production build (backend):
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run build
npm start
```

---

## 📋 Полезные команды

### Просмотр логов backend:
```bash
tail -f /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/logs/backend.log
```

### Проверить открытые порты:
```bash
lsof -i :3001  # Backend
lsof -i :8081  # Expo
```

### Установить зависимости заново:
```bash
# Backend
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
rm -rf node_modules package-lock.json
npm install
```

---

## 🌍 Поддерживаемые города

Все города автоматически поддерживаются через Google Places API:

### Европа:
- 🇫🇷 Париж, Ницца, Лион, Марсель
- 🇮🇹 Рим, Милан, Флоренция, Венеция, Неаполь
- 🇪🇸 Мадрид, Барселона, Севилья, Валенсия
- 🇬🇧 Лондон, Эдинбург, Манчестер
- 🇩🇪 Берлин, Мюнхен, Гамбург, Франкфурт
- 🇵🇹 Лиссабон, Порту
- 🇬🇷 Афины, Санторини
- 🇳🇱 Амстердам
- 🇹🇷 Стамбул, Анталья

### Остальной мир:
- 🇯🇵 Токио, Киото, Осака
- 🇺🇸 Нью-Йорк, Лос-Анджелес, Сан-Франциско, Майами
- 🇹🇭 Бангкок, Пхукет

**Итого: 35+ городов с реальными данными Google Places!**

---

## ⚙️ Настройки API

### Файл: `backend/.env`
```env
PORT=3001
OPENAI_API_KEY=sk-proj-...  # ✅ Настроен
GOOGLE_PLACES_API_KEY=AIza...  # ✅ Настроен
```

### Получить API ключи:
- **OpenAI**: https://platform.openai.com/api-keys
- **Google Places**: https://console.cloud.google.com/apis/credentials

---

**Готово! Все API настроены и работают в production режиме.** 🎉

