import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { CITIES } from '../../constants/cities';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SelectCountry'>;
};

// Country data with emojis
interface CountryData {
  id: string;
  name: string;
  nameRu: string;
  emoji: string;
  cityCount: number;
}

// Get all unique countries from cities
const getAllCountries = (): CountryData[] => {
  const countriesMap = new Map<string, { name: string; nameRu: string; emoji: string; count: number }>();
  
  Object.values(CITIES).forEach(city => {
    const existing = countriesMap.get(city.countryId);
    if (existing) {
      existing.count++;
    } else {
      countriesMap.set(city.countryId, {
        name: city.country,
        nameRu: getCountryNameRu(city.country),
        emoji: getCountryEmoji(city.countryId),
        count: 1,
      });
    }
  });
  
  return Array.from(countriesMap.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    nameRu: data.nameRu,
    emoji: data.emoji,
    cityCount: data.count,
  })).sort((a, b) => a.nameRu.localeCompare(b.nameRu));
};

// Get Russian name for country
const getCountryNameRu = (country: string): string => {
  const map: Record<string, string> = {
    'France': 'Франция',
    'United Kingdom': 'Великобритания',
    'Italy': 'Италия',
    'Germany': 'Германия',
    'Spain': 'Испания',
    'Japan': 'Япония',
    'USA': 'США',
    'Thailand': 'Таиланд',
    'Portugal': 'Португалия',
    'Greece': 'Греция',
    'Netherlands': 'Нидерланды',
    'Turkey': 'Турция',
  };
  return map[country] || country;
};

// Get emoji for country
const getCountryEmoji = (countryId: string): string => {
  const map: Record<string, string> = {
    'france': '🇫🇷',
    'uk': '🇬🇧',
    'italy': '🇮🇹',
    'germany': '🇩🇪',
    'spain': '🇪🇸',
    'japan': '🇯🇵',
    'usa': '🇺🇸',
    'thailand': '🇹🇭',
    'portugal': '🇵🇹',
    'greece': '🇬🇷',
    'netherlands': '🇳🇱',
    'turkey': '🇹🇷',
  };
  return map[countryId] || '🌍';
};

// Popular countries
const POPULAR_COUNTRIES = ['france', 'italy', 'spain', 'uk', 'germany', 'japan'];

export function SelectCountryScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  const allCountries = getAllCountries();
  
  // Sort: popular first, then alphabetically
  const sortedCountries = [...allCountries].sort((a, b) => {
    const aPopular = POPULAR_COUNTRIES.includes(a.id);
    const bPopular = POPULAR_COUNTRIES.includes(b.id);
    if (aPopular && !bPopular) return -1;
    if (!aPopular && bPopular) return 1;
    return a.nameRu.localeCompare(b.nameRu);
  });

  // Filter countries based on search
  const getFilteredCountries = (): CountryData[] => {
    if (!searchQuery.trim()) return sortedCountries;
    
    const query = searchQuery.toLowerCase();
    return sortedCountries.filter(country => 
      country.nameRu.toLowerCase().includes(query) ||
      country.name.toLowerCase().includes(query)
    );
  };

  const filteredCountries = getFilteredCountries();

  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
  };

  const handleContinue = () => {
    if (selectedCountry) {
      navigation.navigate('SelectCity', { countryId: selectedCountry.id });
    }
  };

  const renderCountryCard = (country: CountryData, isLarge: boolean = false) => (
    <TouchableOpacity
      key={country.id}
      onPress={() => handleSelectCountry(country)}
      activeOpacity={0.8}
      style={[
        styles.countryCard,
        isLarge ? styles.countryCardLarge : styles.countryCardSmall,
        selectedCountry?.id === country.id && styles.countryCardSelected,
      ]}
    >
      <Card
        style={[
          styles.cardInner,
          selectedCountry?.id === country.id && styles.cardInnerSelected,
        ]}
        variant={selectedCountry?.id === country.id ? 'elevated' : 'default'}
      >
        <Text style={styles.countryEmoji}>{country.emoji}</Text>
        <Text
          style={[
            styles.countryName,
            selectedCountry?.id === country.id && styles.countryNameSelected,
          ]}
          numberOfLines={1}
        >
          {country.nameRu}
        </Text>
        <Text style={styles.countrySubtitle} numberOfLines={1}>
          {country.cityCount} {country.cityCount === 1 ? 'город' : 'городов'}
        </Text>
        {selectedCountry?.id === country.id && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Выбери страну 🌍</Text>
          <Text style={styles.subtitle}>Куда отправимся?</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск страны..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Results or All Countries */}
        {searchQuery.trim() ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Результаты ({filteredCountries.length})
            </Text>
            {filteredCountries.length > 0 ? (
              <View style={styles.countriesGrid}>
                {filteredCountries.map(country => renderCountryCard(country, false))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🤷</Text>
                <Text style={styles.emptyText}>Страна не найдена</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Popular Countries */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 Популярные направления</Text>
              <View style={styles.countriesGrid}>
                {sortedCountries
                  .filter(c => POPULAR_COUNTRIES.includes(c.id))
                  .map(country => renderCountryCard(country, false))}
              </View>
            </View>

            {/* All Countries */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌍 Все страны</Text>
              <View style={styles.countriesGrid}>
                {sortedCountries.map(country => renderCountryCard(country, false))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      {selectedCountry && (
        <View style={styles.footer}>
          <View style={styles.selectedCountryInfo}>
            <Text style={styles.selectedCountryEmoji}>{selectedCountry.emoji}</Text>
            <View style={styles.selectedCountryText}>
              <Text style={styles.selectedCountryName} numberOfLines={1}>
                {selectedCountry.nameRu}
              </Text>
              <Text style={styles.selectedCountrySubtitle} numberOfLines={1}>
                {selectedCountry.cityCount} {selectedCountry.cityCount === 1 ? 'город' : 'городов'}
              </Text>
            </View>
          </View>
          <Button
            title="Выбрать город →"
            onPress={handleContinue}
            variant="accent"
            size="lg"
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  countryCard: {
    padding: Spacing.xs,
  },
  countryCardSmall: {
    width: CARD_WIDTH,
  },
  countryCardLarge: {
    width: '100%',
  },
  countryCardSelected: {
    // Handled by card variant
  },
  cardInner: {
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    position: 'relative',
  },
  cardInnerSelected: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  countryEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  countryName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  countryNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  countrySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    color: Colors.textOnPrimary,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedCountryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
  },
  selectedCountryEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  selectedCountryText: {
    flex: 1,
  },
  selectedCountryName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  selectedCountrySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});

