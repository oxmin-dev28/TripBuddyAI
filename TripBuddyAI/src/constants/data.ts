// Countries data
export const COUNTRIES = [
  { id: 'france', label: 'Франция 🇫🇷', emoji: '🇫🇷' },
  { id: 'uk', label: 'Великобритания 🇬🇧', emoji: '🇬🇧' },
  { id: 'italy', label: 'Италия 🇮🇹', emoji: '🇮🇹' },
  { id: 'germany', label: 'Германия 🇩🇪', emoji: '🇩🇪' },
  { id: 'spain', label: 'Испания 🇪🇸', emoji: '🇪🇸' },
  { id: 'japan', label: 'Япония 🇯🇵', emoji: '🇯🇵' },
  { id: 'usa', label: 'США 🇺🇸', emoji: '🇺🇸' },
  { id: 'thailand', label: 'Таиланд 🇹🇭', emoji: '🇹🇭' },
  { id: 'portugal', label: 'Португалия 🇵🇹', emoji: '🇵🇹' },
  { id: 'greece', label: 'Греция 🇬🇷', emoji: '🇬🇷' },
  { id: 'netherlands', label: 'Нидерланды 🇳🇱', emoji: '🇳🇱' },
  { id: 'turkey', label: 'Турция 🇹🇷', emoji: '🇹🇷' },
] as const;

// Cuisines data with country associations
export const CUISINES = [
  { id: 'french', label: 'Французская', countries: ['france'] },
  { id: 'italian', label: 'Итальянская', countries: ['italy'] },
  { id: 'british', label: 'Британская', countries: ['uk'] },
  { id: 'german', label: 'Немецкая', countries: ['germany'] },
  { id: 'spanish', label: 'Испанская', countries: ['spain'] },
  { id: 'japanese', label: 'Японская', countries: ['japan'] },
  { id: 'american', label: 'Американская', countries: ['usa'] },
  { id: 'thai', label: 'Тайская', countries: ['thailand'] },
  { id: 'portuguese', label: 'Португальская', countries: ['portugal'] },
  { id: 'greek', label: 'Греческая', countries: ['greece'] },
  { id: 'turkish', label: 'Турецкая', countries: ['turkey'] },
  { id: 'mexican', label: 'Мексиканская', countries: [] },
  { id: 'chinese', label: 'Китайская', countries: [] },
  { id: 'indian', label: 'Индийская', countries: [] },
  { id: 'korean', label: 'Корейская', countries: [] },
  { id: 'vietnamese', label: 'Вьетнамская', countries: [] },
  { id: 'mediterranean', label: 'Средиземноморская', countries: ['greece', 'italy', 'spain'] },
] as const;

// Activity types
export const ACTIVITY_TYPES = [
  { 
    id: 'active', 
    label: 'Активный', 
    description: 'Походы, клубы, экстрим',
    emoji: '⚡'
  },
  { 
    id: 'passive', 
    label: 'Пассивный', 
    description: 'Пляжи, бары, релакс',
    emoji: '🌴'
  },
  { 
    id: 'mixed', 
    label: 'Смешанный', 
    description: 'Баланс активности и отдыха',
    emoji: '🎯'
  },
] as const;

// Budget levels
export const BUDGET_LEVELS = [
  { id: 'low', label: 'Бюджетный', description: '$ - До 50€/день', emoji: '💰' },
  { id: 'medium', label: 'Средний', description: '$$ - 50-150€/день', emoji: '💵' },
  { id: 'high', label: 'Премиум', description: '$$$ - 150€+/день', emoji: '💎' },
] as const;

// Interests
export const INTERESTS = [
  { id: 'history', label: 'История', emoji: '🏛️' },
  { id: 'food', label: 'Еда', emoji: '🍽️' },
  { id: 'shopping', label: 'Шопинг', emoji: '🛍️' },
  { id: 'nature', label: 'Природа', emoji: '🌲' },
  { id: 'nightlife', label: 'Ночная жизнь', emoji: '🎉' },
  { id: 'art', label: 'Искусство', emoji: '🎨' },
  { id: 'sports', label: 'Спорт', emoji: '⚽' },
  { id: 'photo', label: 'Фото', emoji: '📸' },
  { id: 'architecture', label: 'Архитектура', emoji: '🏰' },
  { id: 'local', label: 'Местная культура', emoji: '🎭' },
] as const;

// Day options
export const DAY_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 1);

