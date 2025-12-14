# 🔑 Настройка API ключей для TripBuddy AI

## 1. Google Places API

### Шаг 1: Создай проект в Google Cloud
1. Перейди на [Google Cloud Console](https://console.cloud.google.com/)
2. Создай новый проект или выбери существующий
3. Включи биллинг (есть бесплатный лимит $200/месяц)

### Шаг 2: Включи необходимые API
1. Перейди в **APIs & Services** → **Library**
2. Найди и включи:
   - **Places API**
   - **Maps JavaScript API** (для карты в приложении)
   - **Geocoding API** (опционально)

### Шаг 3: Создай API ключ
1. Перейди в **APIs & Services** → **Credentials**
2. Нажми **Create Credentials** → **API Key**
3. Скопируй ключ

### Шаг 4: Добавь в backend/.env
```env
GOOGLE_PLACES_API_KEY=AIzaSy...ваш-ключ...
```

---

## 2. OpenAI API (для AI генерации маршрутов)

### Шаг 1: Создай аккаунт OpenAI
1. Перейди на [platform.openai.com](https://platform.openai.com/)
2. Зарегистрируйся или войди

### Шаг 2: Создай API ключ
1. Перейди в **API Keys**
2. Нажми **Create new secret key**
3. Скопируй ключ (показывается только один раз!)

### Шаг 3: Добавь в backend/.env
```env
OPENAI_API_KEY=sk-...ваш-ключ...
```

---

## 3. Полный файл backend/.env

Создай файл `backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# OpenAI API
OPENAI_API_KEY=sk-ваш-openai-ключ

# Google Places API
GOOGLE_PLACES_API_KEY=AIzaSy-ваш-google-ключ

# Database (опционально)
DATABASE_URL=

# CORS
CORS_ORIGIN=*
```

---

## 4. Проверка работы

### Проверить backend:
```bash
curl http://localhost:3001/health
```

### Проверить Google Places:
```bash
curl "http://localhost:3001/api/places?lat=48.8566&lng=2.3522&type=restaurant"
```

### Проверить генерацию плана:
```bash
curl -X POST http://localhost:3001/api/generate-plan \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "location": {"lat": 48.8566, "lng": 2.3522, "city": "Paris"},
    "preferences": {
      "countries": ["france"],
      "cuisines": ["french"],
      "activityType": "mixed",
      "days": 2,
      "budget": "medium",
      "interests": ["food", "history"]
    }
  }'
```

---

## 💡 Без API ключей

Приложение работает и без ключей:
- **Без OpenAI** → генерирует demo маршруты с mock данными
- **Без Google Places** → показывает тестовые места

Это удобно для разработки и тестирования!

---

## 🔒 Безопасность

⚠️ **Никогда не коммить API ключи в git!**

Файл `.env` уже добавлен в `.gitignore`.

Для продакшена используй:
- Environment variables в Vercel/Heroku
- Secret management (AWS Secrets, Vault)

