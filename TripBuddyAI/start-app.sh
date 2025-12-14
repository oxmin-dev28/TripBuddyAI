#!/bin/bash

# Остановить все процессы Expo
pkill -f "expo start" 2>/dev/null
pkill -f "metro" 2>/dev/null
sleep 1

# Очистить кэш
cd "$(dirname "$0")"
rm -rf .expo node_modules/.cache

echo "✨ Кэш очищен"
echo "🚀 Запускаем Expo..."
echo ""
echo "⚠️  Если спросит про Expo account - выбери 'Proceed anonymously'"
echo ""

# Запустить Expo
npx expo start --clear
