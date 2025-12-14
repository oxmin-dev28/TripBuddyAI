# 🚀 Запуск TripBuddy AI на продакшен сервере

## Требования к серверу

- **OS:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM:** Минимум 1GB (рекомендуется 2GB+)
- **CPU:** 1 core (рекомендуется 2+)
- **Node.js:** 18.x или выше
- **PM2:** Для управления процессами
- **Nginx:** Для reverse proxy (опционально)

---

## Шаг 1: Подготовка сервера

### Подключение к серверу
```bash
ssh user@your-server-ip
```

### Установка Node.js 18+
```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверить версию
node --version  # должно быть v18.x или выше
npm --version
```

### Установка PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Проверить
pm2 --version
```

### Установка Git
```bash
sudo apt install -y git
```

---

## Шаг 2: Клонирование проекта

```bash
# Создать директорию для проектов
mkdir -p ~/projects
cd ~/projects

# Клонировать репозиторий (замени на свой URL)
git clone https://github.com/your-username/tripgid.git
cd tripgid/TripBuddyAI
```

---

## Шаг 3: Настройка Backend

```bash
cd backend

# Установить зависимости
npm install --production

# Создать .env файл
cp .env.example .env
nano .env
```

### Заполнить .env:
```env
# Google Places API (ОБЯЗАТЕЛЬНО для прода!)
GOOGLE_PLACES_API_KEY=AIzaSyB_твой_реальный_ключ

# OpenAI API (опционально)
OPENAI_API_KEY=sk-proj-...

# Server
PORT=3001
NODE_ENV=production

# Database (для будущих версий)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tripbuddy
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

**Сохранить:** `Ctrl+X`, затем `Y`, затем `Enter`

### Собрать TypeScript
```bash
npm run build
```

---

## Шаг 4: Запуск Backend через PM2

```bash
# Находясь в папке backend/
pm2 start dist/server.js --name tripbuddy-backend

# Проверить статус
pm2 status

# Посмотреть логи
pm2 logs tripbuddy-backend

# Настроить автозапуск при перезагрузке сервера
pm2 startup
pm2 save
```

### Проверить работу:
```bash
curl http://localhost:3001/api/status
```

Должен вернуть JSON со статусом Google Places API.

---

## Шаг 5: Настройка Nginx (Reverse Proxy)

### Установить Nginx
```bash
sudo apt install -y nginx
```

### Создать конфиг для API
```bash
sudo nano /etc/nginx/sites-available/tripbuddy-api
```

### Добавить конфигурацию:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Замени на свой домен

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Активировать конфиг:
```bash
sudo ln -s /etc/nginx/sites-available/tripbuddy-api /etc/nginx/sites-enabled/
sudo nginx -t  # Проверить конфиг
sudo systemctl restart nginx
```

---

## Шаг 6: Настройка SSL (HTTPS) через Let's Encrypt

```bash
# Установить certbot
sudo apt install -y certbot python3-certbot-nginx

# Получить SSL сертификат (замени email и домен!)
sudo certbot --nginx -d api.yourdomain.com --email your@email.com --agree-tos --no-eff-email

# Автообновление сертификата
sudo systemctl enable certbot.timer
```

---

## Шаг 7: Настройка Firewall

```bash
# Разрешить HTTP, HTTPS, SSH
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Проверить статус
sudo ufw status
```

---

## Шаг 8: Сборка Mobile App для прода

### На локальной машине:

#### Обновить API URL
Открой `TripBuddyAI/src/services/api.ts` и измени:

```typescript
const API_BASE_URL = 
  __DEV__ 
    ? Platform.select({
        ios: 'http://localhost:3001/api',
        android: 'http://10.0.2.2:3001/api',
        default: 'http://localhost:3001/api',
      })
    : 'https://api.yourdomain.com/api';  // <-- Твой продакшен URL
```

#### Собрать для iOS
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI

# Установить зависимости
npm install

# Собрать iOS build
npx expo build:ios
# или для нового EAS Build:
eas build --platform ios
```

#### Собрать для Android
```bash
# Собрать Android build
npx expo build:android
# или для нового EAS Build:
eas build --platform android
```

---

## Шаг 9: Мониторинг и управление

### Полезные PM2 команды:
```bash
# Посмотреть статус
pm2 status

# Логи в реальном времени
pm2 logs tripbuddy-backend

# Рестарт после изменений
pm2 restart tripbuddy-backend

# Остановить
pm2 stop tripbuddy-backend

# Удалить из PM2
pm2 delete tripbuddy-backend

# Мониторинг ресурсов
pm2 monit
```

### Автоматические обновления из Git:
```bash
cd ~/projects/tripgid/TripBuddyAI/backend

# Получить последние изменения
git pull origin main

# Пересобрать
npm install --production
npm run build

# Рестарт через PM2
pm2 restart tripbuddy-backend
```

---

## Шаг 10: Настройка мониторинга (опционально)

### PM2 Plus (бесплатный мониторинг)
```bash
pm2 link <secret> <public>  # Получи ключи на https://app.pm2.io
```

### Логирование в файлы
```bash
# Настроить ротацию логов
pm2 install pm2-logrotate

# Конфигурация
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔒 Безопасность

### 1. Ограничить доступ к .env
```bash
chmod 600 ~/projects/tripgid/TripBuddyAI/backend/.env
```

### 2. Обновлять систему регулярно
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Использовать fail2ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Ограничить Google Places API ключ по IP
В Google Cloud Console → Credentials → Restrict Key → IP addresses:
- Добавь IP твоего сервера

---

## 📊 Проверка работы

### 1. Проверить Backend API:
```bash
curl https://api.yourdomain.com/api/status
```

### 2. Проверить поиск мест (Париж):
```bash
curl "https://api.yourdomain.com/api/places/search?lat=48.8566&lng=2.3522&type=restaurant"
```

### 3. Проверить логи Google Places:
```bash
pm2 logs tripbuddy-backend | grep GooglePlaces
```

Должен видеть:
```
✅ [GooglePlaces] API working! Found XX places
🌐 [GooglePlaces] Calling Google Places API...
```

---

## 🚨 Troubleshooting

### Backend не запускается:
```bash
# Проверить логи
pm2 logs tripbuddy-backend --lines 100

# Проверить порт
sudo lsof -i :3001

# Проверить переменные окружения
pm2 env 0
```

### Google Places API не работает:
1. Проверь `.env` файл — правильный ли ключ?
2. Проверь в Google Cloud Console — включен ли Places API?
3. Проверь биллинг — привязана ли карта?
4. Посмотри логи: `pm2 logs tripbuddy-backend | grep GooglePlaces`

### 502 Bad Gateway от Nginx:
```bash
# Проверить, запущен ли backend
pm2 status

# Проверить порт
curl http://localhost:3001/api/status

# Проверить логи Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🎯 Быстрый запуск (после настройки)

```bash
# 1. Подключиться к серверу
ssh user@your-server-ip

# 2. Проверить статус
pm2 status

# 3. Если не запущен — запустить
cd ~/projects/tripgid/TripBuddyAI/backend
pm2 start dist/server.js --name tripbuddy-backend

# 4. Проверить работу
curl http://localhost:3001/api/status
```

---

## ✅ Checklist перед запуском

- [ ] Node.js 18+ установлен
- [ ] PM2 установлен
- [ ] Проект склонирован
- [ ] `npm install` выполнен
- [ ] `.env` файл создан и заполнен
- [ ] Google Places API ключ добавлен
- [ ] `npm run build` выполнен успешно
- [ ] PM2 процесс запущен
- [ ] Nginx настроен (если нужен)
- [ ] SSL сертификат получен (для прода)
- [ ] Firewall настроен
- [ ] API отвечает на запросы

---

## 🆘 Поддержка

Если что-то не работает:
1. Проверь логи: `pm2 logs tripbuddy-backend`
2. Проверь статус: `pm2 status`
3. Проверь API вручную: `curl http://localhost:3001/api/status`
4. Проверь Google Cloud Console — Places API включен?

---

Готово! 🎉 Твой TripBuddy AI работает на продакшен сервере с **реальными данными Google Places** для всех городов мира! 🌍

