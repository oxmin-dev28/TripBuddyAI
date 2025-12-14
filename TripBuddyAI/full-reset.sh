#!/bin/bash

echo "🔥 ПОЛНАЯ ПЕРЕУСТАНОВКА - это точно исправит проблему"
echo ""

cd "$(dirname "$0")"

# 1. Убить все процессы
echo "1️⃣ Останавливаем все процессы..."
pkill -9 -f "expo" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null
pkill -9 -f "node.*8081" 2>/dev/null
sleep 2

# 2. Удалить ВСЁ
echo "2️⃣ Удаляем все кэши и зависимости..."
rm -rf node_modules
rm -rf .expo
rm -rf .cache
rm -rf package-lock.json
rm -rf yarn.lock
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/react-* 2>/dev/null
rm -rf /tmp/haste-* 2>/dev/null

# Watchman
watchman watch-del-all 2>/dev/null || echo "Watchman не установлен (это нормально)"

echo ""
echo "3️⃣ Переустанавливаем зависимости..."
npm install

echo ""
echo "4️⃣ Очищаем Metro кэш..."
npx expo start --clear &

sleep 3
echo ""
echo "✅ ГОТОВО!"
echo ""
echo "🎯 Теперь:"
echo "   1. Полностью закрой Expo Go на телефоне"
echo "   2. Отсканируй QR-код ЗАНОВО"
echo "   3. Должно заработать без ошибок!"
echo ""

