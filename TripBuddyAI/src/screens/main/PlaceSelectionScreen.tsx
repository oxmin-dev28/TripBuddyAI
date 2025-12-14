import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Button, Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { RootStackParamList, PlaceOption, CityData } from '../../types';
import { getNearbyPlaces } from '../../services/api';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlaceSelection'>;
  route: RouteProp<RootStackParamList, 'PlaceSelection'>;
};

const PLACE_CATEGORIES = [
  { id: 'restaurant', emoji: '🍽️', label: 'Рестораны', type: 'restaurant' },
  { id: 'cafe', emoji: '☕', label: 'Кафе', type: 'cafe' },
  { id: 'museum', emoji: '🏛️', label: 'Музеи', type: 'museum' },
  { id: 'attraction', emoji: '🎭', label: 'Достопримечательности', type: 'tourist_attraction' },
  { id: 'park', emoji: '🌳', label: 'Парки', type: 'park' },
  { id: 'shopping', emoji: '🛍️', label: 'Шопинг', type: 'shopping_mall' },
];

export function PlaceSelectionScreen({ navigation, route }: Props) {
  const { selectedCity, numDays } = route.params;
  const { state } = useApp();
  
  const [selectedCategory, setSelectedCategory] = useState(PLACE_CATEGORIES[0].id);
  const [allPlaces, setAllPlaces] = useState<PlaceOption[]>([]); // Все загруженные места
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Загрузить все места один раз при монтировании
  useEffect(() => {
    loadAllPlaces();
  }, []);

  const loadAllPlaces = async () => {
    setLoading(true);
    setLoadingProgress(0);
    
    try {
      const allResults: PlaceOption[] = [];
      const totalCategories = PLACE_CATEGORIES.length;
      
      // Загружаем места для всех категорий параллельно
      const promises = PLACE_CATEGORIES.map(async (category, index) => {
        try {
          const result = await getNearbyPlaces(
            selectedCity.lat,
            selectedCity.lng,
            category.type,
            state.preferences.cuisines.length > 0 ? state.preferences.cuisines.join(',') : undefined,
            state.preferences.budget,
            state.preferences.interests.length > 0 ? state.preferences.interests.join(',') : undefined,
            5000 // 5km radius
          );
          
          // Добавляем тип категории к каждому месту для фильтрации
          const placesWithType = result.map(place => ({
            ...place,
            categoryType: category.type,
            categoryId: category.id,
          }));
          
          setLoadingProgress(((index + 1) / totalCategories) * 100);
          return placesWithType;
        } catch (error) {
          console.error(`Error loading ${category.label}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all(promises);
      
      // Объединяем все результаты и удаляем дубликаты по place_id
      const uniquePlaces = new Map<string, PlaceOption>();
      results.flat().forEach(place => {
        if (!uniquePlaces.has(place.id)) {
          uniquePlaces.set(place.id, place);
        }
      });
      
      setAllPlaces(Array.from(uniquePlaces.values()));
      console.log(`✅ Загружено ${uniquePlaces.size} уникальных мест`);
    } catch (error) {
      console.error('Error loading places:', error);
      setAllPlaces([]);
    } finally {
      setLoading(false);
      setLoadingProgress(100);
    }
  };

  // Фильтруем места по выбранной категории (на клиенте)
  const filteredPlaces = allPlaces.filter(place => {
    const category = PLACE_CATEGORIES.find(c => c.id === selectedCategory);
    return category && place.categoryType === category.type;
  }).slice(0, 20); // Показываем топ 20 для каждой категории

  const togglePlace = (placeId: string) => {
    const newSelected = new Set(selectedPlaces);
    if (newSelected.has(placeId)) {
      newSelected.delete(placeId);
    } else {
      newSelected.add(placeId);
    }
    setSelectedPlaces(newSelected);
  };

  const handleContinue = () => {
    // Get all selected places from all categories
    const selectedPlacesList = allPlaces.filter(p => selectedPlaces.has(p.id));
    
    // Navigate to route generation with selected places
    navigation.navigate('GeneratePlan', {
      selectedCity,
      selectedPlaces: selectedPlacesList,
    });
  };

  const currentCategory = PLACE_CATEGORIES.find(c => c.id === selectedCategory);
  const minPlaces = Math.max(5, numDays * 2); // At least 5, or 2 per day

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Выбери места 📍</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {selectedCity.nameRu} • {selectedPlaces.size} выбрано
            {!loading && allPlaces.length > 0 && ` • ${allPlaces.length} мест`}
          </Text>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {PLACE_CATEGORIES.map(category => {
          const categoryPlacesCount = allPlaces.filter(
            p => p.categoryType === category.type
          ).length;
          
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive,
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <View style={styles.categoryLabelContainer}>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === category.id && styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
                {!loading && categoryPlacesCount > 0 && (
                  <Text
                    style={[
                      styles.categoryCount,
                      selectedCategory === category.id && styles.categoryCountActive,
                    ]}
                  >
                    {categoryPlacesCount}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Progress Indicator */}
      {selectedPlaces.size > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((selectedPlaces.size / minPlaces) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {selectedPlaces.size >= minPlaces
              ? '✓ Достаточно мест!'
              : `Выбери ещё ${minPlaces - selectedPlaces.size}`}
          </Text>
        </View>
      )}

      {/* Places List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              Загружаем места... {Math.round(loadingProgress)}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${loadingProgress}%` },
                ]}
              />
            </View>
          </View>
        ) : filteredPlaces.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🤷</Text>
            <Text style={styles.emptyText}>
              {allPlaces.length === 0 
                ? 'Места не найдены' 
                : `Нет мест в категории "${currentCategory?.label}"`}
            </Text>
          </View>
        ) : (
          filteredPlaces.map(place => {
            const isSelected = selectedPlaces.has(place.id);
            return (
              <TouchableOpacity
                key={place.id}
                onPress={() => togglePlace(place.id)}
                activeOpacity={0.8}
              >
                <Card
                  style={[
                    styles.placeCard,
                    isSelected && styles.placeCardSelected,
                  ]}
                  variant={isSelected ? 'elevated' : 'default'}
                >
                  <View style={styles.placeHeader}>
                    <View style={styles.placeInfo}>
                      <Text
                        style={[
                          styles.placeName,
                          isSelected && styles.placeNameSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {place.name}
                      </Text>
                      <Text style={styles.placeAddress} numberOfLines={1}>
                        {place.address}
                      </Text>
                    </View>
                    <View style={styles.placeRating}>
                      <Text style={styles.ratingStar}>⭐</Text>
                      <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                    </View>
                  </View>

                  <View style={styles.placeMeta}>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaText}>📍 {place.distance}</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaText}>💰 {place.priceLevel}</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaText}>🚶 {place.duration}</Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Footer */}
      {selectedPlaces.size >= minPlaces && (
        <View style={styles.footer}>
          <Button
            title={`Создать маршрут (${selectedPlaces.size} мест) →`}
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
  categoriesScroll: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  categoryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.textOnPrimary,
  },
  categoryCount: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryCountActive: {
    color: Colors.textOnPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
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
  placeCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    position: 'relative',
  },
  placeCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  placeInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  placeName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  placeNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  placeAddress: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  placeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  ratingStar: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  placeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaChip: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    color: Colors.textOnPrimary,
    fontWeight: '700',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
});

