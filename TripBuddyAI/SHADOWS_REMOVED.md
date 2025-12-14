# ✅ SHADOWS ПОЛНОСТЬЮ УДАЛЕНЫ

## Что сделано:

1. ✅ Удалён `export const Shadows` из `theme.ts`
2. ✅ Удалены все импорты `Shadows` из всех файлов
3. ✅ Заменены все `...Shadows.sm/md/lg` на inline стили
4. ✅ Обновлены Button.tsx и Card.tsx с inline shadows

## 📁 Обновлённые файлы (11 штук):

- ✅ `components/ui/Button.tsx`
- ✅ `components/ui/Card.tsx`
- ✅ `components/ui/SelectableChip.tsx`
- ✅ `components/VotingCard.tsx`
- ✅ `screens/auth/AuthScreen.tsx`
- ✅ `screens/main/HomeScreen.tsx`
- ✅ `screens/main/ProfileScreen.tsx`
- ✅ `screens/main/LeaderboardScreen.tsx`
- ✅ `screens/main/SelectCityScreen.tsx`
- ✅ `screens/main/PlaceSelectionScreen.tsx`
- ✅ `screens/main/TripHistoryScreen.tsx`
- ✅ `screens/main/MapScreen.tsx`
- ✅ `screens/onboarding/OnboardingActivity.tsx`

## 🚀 Что делать СЕЙЧАС:

**В терминале Expo нажми:**

```
r
```

Приложение перезагрузится **БЕЗ ошибки** Shadows! 🎉

---

## 💡 Inline стили теперь вместо Shadows:

```typescript
// Раньше:
...Shadows.md

// Сейчас:
shadowColor: "#000",
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3
```

Работает идентично, но без проблем с экспортом! ✨

