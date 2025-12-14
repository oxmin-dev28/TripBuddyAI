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
import { RouteProp } from '@react-navigation/native';
import { Button, Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { RootStackParamList } from '../../types';
import { CITIES, CityData, getCitiesByCountry } from '../../constants/cities';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SelectCity'>;
  route: RouteProp<RootStackParamList, 'SelectCity'>;
};

// Get country name in Russian
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

// Get emoji for city (using country flag)
const getCityEmoji = (countryId: string): string => {
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
  return map[countryId] || '🏙️';
};

export function SelectCityScreen({ navigation, route }: Props) {
  const { countryId } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const { state } = useApp();

  // Get cities for selected country
  const countryCities = getCitiesByCountry(countryId);
  const countryName = countryCities[0]?.country || '';
  const countryNameRu = getCountryNameRu(countryName);

  // Filter cities based on search
  const getFilteredCities = (): CityData[] => {
    if (!searchQuery.trim()) return countryCities;
    
    const query = searchQuery.toLowerCase();
    return countryCities.filter(city => 
      city.nameRu.toLowerCase().includes(query) ||
      city.name.toLowerCase().includes(query)
    );
  };

  const filteredCities = getFilteredCities();

  const handleSelectCity = (city: CityData) => {
    setSelectedCity(city);
  };

  const handleContinue = () => {
    if (selectedCity) {
      navigation.navigate('PlaceSelection', {
        selectedCity,
        numDays: state.preferences.days,
      });
    }
  };

  const renderCityCard = (city: CityData, isLarge: boolean = false) => (
    <TouchableOpacity
      key={city.id}
      onPress={() => handleSelectCity(city)}
      activeOpacity={0.8}
      style={[
        styles.cityCard,
        isLarge ? styles.cityCardLarge : styles.cityCardSmall,
        selectedCity?.id === city.id && styles.cityCardSelected,
      ]}
    >
      <Card
        style={[
          styles.cardInner,
          selectedCity?.id === city.id && styles.cardInnerSelected,
        ]}
        variant={selectedCity?.id === city.id ? 'elevated' : 'default'}
      >
        <Text style={styles.cityEmoji}>{getCityEmoji(city.countryId)}</Text>
        <Text
          style={[
            styles.cityName,
            selectedCity?.id === city.id && styles.cityNameSelected,
          ]}
          numberOfLines={1}
        >
          {city.nameRu}
        </Text>
        <Text style={styles.cityCountry} numberOfLines={1}>
          {city.country}
        </Text>
        {selectedCity?.id === city.id && (
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
          <Text style={styles.title}>Выбери город 🏙️</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{countryNameRu}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск города..."
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
        {/* Cities List */}
        {searchQuery.trim() ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Результаты ({filteredCities.length})
            </Text>
            {filteredCities.length > 0 ? (
              <View style={styles.citiesGrid}>
                {filteredCities.map(city => renderCityCard(city, false))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🤷</Text>
                <Text style={styles.emptyText}>Город не найден</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Города в {countryNameRu} ({countryCities.length})
            </Text>
            <View style={styles.citiesGrid}>
              {countryCities.map(city => renderCityCard(city, false))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      {selectedCity && (
        <View style={styles.footer}>
          <View style={styles.selectedCityInfo}>
            <Text style={styles.selectedCityEmoji}>{getCityEmoji(selectedCity.countryId)}</Text>
            <View style={styles.selectedCityText}>
              <Text style={styles.selectedCityName} numberOfLines={1}>
                {selectedCity.nameRu}
              </Text>
              <Text style={styles.selectedCityCountry} numberOfLines={1}>
                {selectedCity.country}
              </Text>
            </View>
          </View>
          <Button
            title="Продолжить →"
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
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
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
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  cityCard: {
    padding: Spacing.xs,
  },
  cityCardSmall: {
    width: CARD_WIDTH,
  },
  cityCardLarge: {
    width: '100%',
  },
  cityCardSelected: {
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
  cityEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  cityName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  cityNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  cityCountry: {
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
  countrySection: {
    marginBottom: Spacing.lg,
  },
  countryTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
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
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  selectedCityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
  },
  selectedCityEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  selectedCityText: {
    flex: 1,
  },
  selectedCityName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  selectedCityCountry: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});

