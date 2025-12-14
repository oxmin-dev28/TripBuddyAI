// City coordinates database
// Used for route planning - places are loaded relative to destination city

export interface CityData {
  id: string;
  name: string;
  nameRu: string;
  country: string;
  countryId: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const CITIES: Record<string, CityData> = {
  // France
  paris: {
    id: 'paris',
    name: 'Paris',
    nameRu: 'Париж',
    country: 'France',
    countryId: 'france',
    lat: 48.8566,
    lng: 2.3522,
    timezone: 'Europe/Paris',
  },
  nice: {
    id: 'nice',
    name: 'Nice',
    nameRu: 'Ницца',
    country: 'France',
    countryId: 'france',
    lat: 43.7102,
    lng: 7.2620,
    timezone: 'Europe/Paris',
  },
  lyon: {
    id: 'lyon',
    name: 'Lyon',
    nameRu: 'Лион',
    country: 'France',
    countryId: 'france',
    lat: 45.7640,
    lng: 4.8357,
    timezone: 'Europe/Paris',
  },
  marseille: {
    id: 'marseille',
    name: 'Marseille',
    nameRu: 'Марсель',
    country: 'France',
    countryId: 'france',
    lat: 43.2965,
    lng: 5.3698,
    timezone: 'Europe/Paris',
  },

  // UK
  london: {
    id: 'london',
    name: 'London',
    nameRu: 'Лондон',
    country: 'United Kingdom',
    countryId: 'uk',
    lat: 51.5074,
    lng: -0.1278,
    timezone: 'Europe/London',
  },
  edinburgh: {
    id: 'edinburgh',
    name: 'Edinburgh',
    nameRu: 'Эдинбург',
    country: 'United Kingdom',
    countryId: 'uk',
    lat: 55.9533,
    lng: -3.1883,
    timezone: 'Europe/London',
  },
  manchester: {
    id: 'manchester',
    name: 'Manchester',
    nameRu: 'Манчестер',
    country: 'United Kingdom',
    countryId: 'uk',
    lat: 53.4808,
    lng: -2.2426,
    timezone: 'Europe/London',
  },

  // Italy
  rome: {
    id: 'rome',
    name: 'Rome',
    nameRu: 'Рим',
    country: 'Italy',
    countryId: 'italy',
    lat: 41.9028,
    lng: 12.4964,
    timezone: 'Europe/Rome',
  },
  milan: {
    id: 'milan',
    name: 'Milan',
    nameRu: 'Милан',
    country: 'Italy',
    countryId: 'italy',
    lat: 45.4642,
    lng: 9.1900,
    timezone: 'Europe/Rome',
  },
  florence: {
    id: 'florence',
    name: 'Florence',
    nameRu: 'Флоренция',
    country: 'Italy',
    countryId: 'italy',
    lat: 43.7696,
    lng: 11.2558,
    timezone: 'Europe/Rome',
  },
  venice: {
    id: 'venice',
    name: 'Venice',
    nameRu: 'Венеция',
    country: 'Italy',
    countryId: 'italy',
    lat: 45.4408,
    lng: 12.3155,
    timezone: 'Europe/Rome',
  },
  naples: {
    id: 'naples',
    name: 'Naples',
    nameRu: 'Неаполь',
    country: 'Italy',
    countryId: 'italy',
    lat: 40.8518,
    lng: 14.2681,
    timezone: 'Europe/Rome',
  },

  // Germany
  berlin: {
    id: 'berlin',
    name: 'Berlin',
    nameRu: 'Берлин',
    country: 'Germany',
    countryId: 'germany',
    lat: 52.5200,
    lng: 13.4050,
    timezone: 'Europe/Berlin',
  },
  munich: {
    id: 'munich',
    name: 'Munich',
    nameRu: 'Мюнхен',
    country: 'Germany',
    countryId: 'germany',
    lat: 48.1351,
    lng: 11.5820,
    timezone: 'Europe/Berlin',
  },
  hamburg: {
    id: 'hamburg',
    name: 'Hamburg',
    nameRu: 'Гамбург',
    country: 'Germany',
    countryId: 'germany',
    lat: 53.5511,
    lng: 9.9937,
    timezone: 'Europe/Berlin',
  },
  frankfurt: {
    id: 'frankfurt',
    name: 'Frankfurt',
    nameRu: 'Франкфурт',
    country: 'Germany',
    countryId: 'germany',
    lat: 50.1109,
    lng: 8.6821,
    timezone: 'Europe/Berlin',
  },

  // Spain
  madrid: {
    id: 'madrid',
    name: 'Madrid',
    nameRu: 'Мадрид',
    country: 'Spain',
    countryId: 'spain',
    lat: 40.4168,
    lng: -3.7038,
    timezone: 'Europe/Madrid',
  },
  barcelona: {
    id: 'barcelona',
    name: 'Barcelona',
    nameRu: 'Барселона',
    country: 'Spain',
    countryId: 'spain',
    lat: 41.3851,
    lng: 2.1734,
    timezone: 'Europe/Madrid',
  },
  seville: {
    id: 'seville',
    name: 'Seville',
    nameRu: 'Севилья',
    country: 'Spain',
    countryId: 'spain',
    lat: 37.3891,
    lng: -5.9845,
    timezone: 'Europe/Madrid',
  },
  valencia: {
    id: 'valencia',
    name: 'Valencia',
    nameRu: 'Валенсия',
    country: 'Spain',
    countryId: 'spain',
    lat: 39.4699,
    lng: -0.3763,
    timezone: 'Europe/Madrid',
  },

  // Japan
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    nameRu: 'Токио',
    country: 'Japan',
    countryId: 'japan',
    lat: 35.6762,
    lng: 139.6503,
    timezone: 'Asia/Tokyo',
  },
  kyoto: {
    id: 'kyoto',
    name: 'Kyoto',
    nameRu: 'Киото',
    country: 'Japan',
    countryId: 'japan',
    lat: 35.0116,
    lng: 135.7681,
    timezone: 'Asia/Tokyo',
  },
  osaka: {
    id: 'osaka',
    name: 'Osaka',
    nameRu: 'Осака',
    country: 'Japan',
    countryId: 'japan',
    lat: 34.6937,
    lng: 135.5023,
    timezone: 'Asia/Tokyo',
  },

  // USA
  new_york: {
    id: 'new_york',
    name: 'New York',
    nameRu: 'Нью-Йорк',
    country: 'USA',
    countryId: 'usa',
    lat: 40.7128,
    lng: -74.0060,
    timezone: 'America/New_York',
  },
  los_angeles: {
    id: 'los_angeles',
    name: 'Los Angeles',
    nameRu: 'Лос-Анджелес',
    country: 'USA',
    countryId: 'usa',
    lat: 34.0522,
    lng: -118.2437,
    timezone: 'America/Los_Angeles',
  },
  san_francisco: {
    id: 'san_francisco',
    name: 'San Francisco',
    nameRu: 'Сан-Франциско',
    country: 'USA',
    countryId: 'usa',
    lat: 37.7749,
    lng: -122.4194,
    timezone: 'America/Los_Angeles',
  },
  miami: {
    id: 'miami',
    name: 'Miami',
    nameRu: 'Майами',
    country: 'USA',
    countryId: 'usa',
    lat: 25.7617,
    lng: -80.1918,
    timezone: 'America/New_York',
  },

  // Thailand
  bangkok: {
    id: 'bangkok',
    name: 'Bangkok',
    nameRu: 'Бангкок',
    country: 'Thailand',
    countryId: 'thailand',
    lat: 13.7563,
    lng: 100.5018,
    timezone: 'Asia/Bangkok',
  },
  phuket: {
    id: 'phuket',
    name: 'Phuket',
    nameRu: 'Пхукет',
    country: 'Thailand',
    countryId: 'thailand',
    lat: 7.8804,
    lng: 98.3923,
    timezone: 'Asia/Bangkok',
  },

  // Portugal
  lisbon: {
    id: 'lisbon',
    name: 'Lisbon',
    nameRu: 'Лиссабон',
    country: 'Portugal',
    countryId: 'portugal',
    lat: 38.7223,
    lng: -9.1393,
    timezone: 'Europe/Lisbon',
  },
  porto: {
    id: 'porto',
    name: 'Porto',
    nameRu: 'Порту',
    country: 'Portugal',
    countryId: 'portugal',
    lat: 41.1579,
    lng: -8.6291,
    timezone: 'Europe/Lisbon',
  },

  // Greece
  athens: {
    id: 'athens',
    name: 'Athens',
    nameRu: 'Афины',
    country: 'Greece',
    countryId: 'greece',
    lat: 37.9838,
    lng: 23.7275,
    timezone: 'Europe/Athens',
  },
  santorini: {
    id: 'santorini',
    name: 'Santorini',
    nameRu: 'Санторини',
    country: 'Greece',
    countryId: 'greece',
    lat: 36.3932,
    lng: 25.4615,
    timezone: 'Europe/Athens',
  },

  // Netherlands
  amsterdam: {
    id: 'amsterdam',
    name: 'Amsterdam',
    nameRu: 'Амстердам',
    country: 'Netherlands',
    countryId: 'netherlands',
    lat: 52.3676,
    lng: 4.9041,
    timezone: 'Europe/Amsterdam',
  },

  // Turkey
  istanbul: {
    id: 'istanbul',
    name: 'Istanbul',
    nameRu: 'Стамбул',
    country: 'Turkey',
    countryId: 'turkey',
    lat: 41.0082,
    lng: 28.9784,
    timezone: 'Europe/Istanbul',
  },
  antalya: {
    id: 'antalya',
    name: 'Antalya',
    nameRu: 'Анталья',
    country: 'Turkey',
    countryId: 'turkey',
    lat: 36.8969,
    lng: 30.7133,
    timezone: 'Europe/Istanbul',
  },
};

// Get cities by country
export function getCitiesByCountry(countryId: string): CityData[] {
  return Object.values(CITIES).filter(city => city.countryId === countryId);
}

// Get city by ID
export function getCityById(cityId: string): CityData | undefined {
  return CITIES[cityId];
}

// Get default city for country
export function getDefaultCityForCountry(countryId: string): CityData | undefined {
  const cities = getCitiesByCountry(countryId);
  return cities[0];
}

// Search cities by name
export function searchCities(query: string): CityData[] {
  const q = query.toLowerCase();
  return Object.values(CITIES).filter(
    city => city.name.toLowerCase().includes(q) || city.nameRu.toLowerCase().includes(q)
  );
}

