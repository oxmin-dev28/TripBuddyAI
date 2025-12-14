import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { RootStackParamList, TripPlan, DayPlan, TimeSlot, DestinationCity } from '../../types';
import { API_BASE_URL } from '../../services/api';
import { CITIES, getDefaultCityForCountry, CityData } from '../../constants/cities';
import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GeneratePlan'>;
  route: RouteProp<RootStackParamList, 'GeneratePlan'>;
};

type GenerationStep = 'preparing' | 'searching' | 'generating' | 'finalizing' | 'done' | 'error';

const STEP_MESSAGES: Record<GenerationStep, { emoji: string; text: string }> = {
  preparing: { emoji: '🔍', text: 'Анализируем предпочтения...' },
  searching: { emoji: '📍', text: 'Ищем лучшие места рядом...' },
  generating: { emoji: '🤖', text: 'ИИ создаёт маршрут...' },
  finalizing: { emoji: '✨', text: 'Финальные штрихи...' },
  done: { emoji: '🎉', text: 'Маршрут готов!' },
  error: { emoji: '😔', text: 'Что-то пошло не так...' },
};

export function GeneratePlanScreen({ navigation, route }: Props) {
  const { selectedCity, selectedPlaces } = route.params || {};
  const { state, setActivePlan, addToHistory } = useApp();
  const [step, setStep] = useState<GenerationStep>('preparing');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<TripPlan | null>(null);
  const [routeStats, setRouteStats] = useState({
    totalDistance: '0 км',
    estimatedTime: '0 ч',
    estimatedCost: '0€',
    placesCount: 0,
  });
  
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startSpinAnimation();
    generatePlan();
  }, []);

  const startSpinAnimation = () => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const pulseAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const generatePlan = async () => {
    try {
      // Step 1: Preparing
      await simulateStep('preparing', 15);
      
      // Step 2: Searching places
      await simulateStep('searching', 40);
      
      // Step 3: Generating with AI
      setStep('generating');
      pulseAnimation();
      
      // Call API to generate plan
      const plan = await callGeneratePlanAPI();
      
      await simulateStep('finalizing', 90);
      
      // Done!
      setProgress(100);
      setStep('done');
      setGeneratedPlan(plan);
      setActivePlan(plan);
      addToHistory(plan);
      
    } catch (error) {
      console.error('Generation error:', error);
      setStep('error');
      setErrorMessage(error instanceof Error ? error.message : 'Ошибка генерации');
    }
  };

  const simulateStep = (stepName: GenerationStep, targetProgress: number): Promise<void> => {
    return new Promise(resolve => {
      setStep(stepName);
      pulseAnimation();
      
      const duration = 800 + Math.random() * 400;
      const startProgress = progress;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = startProgress + (targetProgress - startProgress) * Math.min(elapsed / duration, 1);
        setProgress(newProgress);
        
        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  };

  const callGeneratePlanAPI = async (): Promise<TripPlan> => {
    // For MVP, generate a mock plan
    // In production, this would call the backend API
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockPlan: TripPlan = generateMockPlan();
    
    // Calculate route statistics
    calculateRouteStats(mockPlan);
    
    return mockPlan;
  };

  const calculateRouteStats = (plan: TripPlan) => {
    let totalDistance = 0;
    let totalTime = 0;
    let totalCost = 0;
    let placesCount = 0;

    plan.days.forEach(day => {
      day.slots.forEach(slot => {
        if (slot.selectedOption) {
          const option = slot.options.find(o => o.id === slot.selectedOption);
          if (option) {
            placesCount++;
            // Parse distance (e.g., "1.2km" -> 1.2)
            const distMatch = option.distance.match(/(\d+\.?\d*)/);
            if (distMatch) totalDistance += parseFloat(distMatch[1]);
            
            // Parse duration (e.g., "15 мин" -> 0.25 hours)
            const durMatch = option.duration.match(/(\d+)/);
            if (durMatch) totalTime += parseInt(durMatch[1]) / 60;
            
            // Parse price level ($ = 10, $$ = 20, $$$ = 40)
            const priceMap: Record<string, number> = { '$': 10, '$$': 20, '$$$': 40 };
            totalCost += priceMap[option.priceLevel] || 15;
          }
        }
      });
    });

    setRouteStats({
      totalDistance: `${totalDistance.toFixed(1)} км`,
      estimatedTime: `${Math.ceil(totalTime)} ч`,
      estimatedCost: `${Math.ceil(totalCost)}€`,
      placesCount,
    });
  };

  // Get destination city based on user's country selection or passed city
  const getDestinationCity = (): CityData => {
    // If city was explicitly selected, use it
    if (selectedCity) {
      return selectedCity;
    }
    
    // Otherwise, use first country from preferences
    const selectedCountry = state.preferences.countries[0];
    if (selectedCountry) {
      const city = getDefaultCityForCountry(selectedCountry);
      if (city) return city;
    }
    // Default to Paris
    return CITIES.paris;
  };

  const generateMockPlan = (): TripPlan => {
    const days: DayPlan[] = [];
    const numDays = state.preferences.days;
    const destinationCity = getDestinationCity();
    
    console.log('📍 [GeneratePlan] Creating plan for:', {
      city: destinationCity.name,
      country: destinationCity.country,
      lat: destinationCity.lat,
      lng: destinationCity.lng,
    });
    
    for (let i = 0; i < numDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const slots: TimeSlot[] = [
        {
          time: '09:00',
          type: 'breakfast',
          title: 'Завтрак',
          options: [
            {
              id: `breakfast-${i}-1`,
              googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
              name: 'Café de Paris',
              type: 'breakfast',
              rating: 4.5,
              priceLevel: '$$',
              distance: '300m',
              duration: '5 мин',
              address: 'Rue de Rivoli, 12',
              isOpen: true,
              votes: 0,
            },
            {
              id: `breakfast-${i}-2`,
              googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY5',
              name: 'Morning Glory',
              type: 'breakfast',
              rating: 4.7,
              priceLevel: '$',
              distance: '500m',
              duration: '8 мин',
              address: 'Avenue des Champs, 45',
              isOpen: true,
              votes: 0,
            },
          ],
        },
        {
          time: '11:00',
          type: 'attraction',
          title: 'Достопримечательность',
          options: [
            {
              id: `attraction-${i}-1`,
              googlePlaceId: 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
              name: 'Музей современного искусства',
              type: 'museum',
              rating: 4.8,
              priceLevel: '$$',
              distance: '1.2km',
              duration: '15 мин',
              address: 'Place du Trocadéro',
              isOpen: true,
              votes: 0,
            },
            {
              id: `attraction-${i}-2`,
              googlePlaceId: 'ChIJLU7jZClu5kcR4PcOOO6p3I1',
              name: 'Исторический квартал',
              type: 'attraction',
              rating: 4.6,
              priceLevel: '$',
              distance: '800m',
              duration: '10 мин',
              address: 'Quartier Latin',
              isOpen: true,
              votes: 0,
            },
          ],
        },
        {
          time: '13:00',
          type: 'lunch',
          title: 'Обед',
          options: [
            {
              id: `lunch-${i}-1`,
              googlePlaceId: 'ChIJATr1n-Fx5kcRjQb6q6cdQDY',
              name: 'Le Petit Bistro',
              type: 'lunch',
              rating: 4.6,
              priceLevel: '$$',
              distance: '400m',
              duration: '6 мин',
              address: 'Rue Saint-Honoré, 234',
              isOpen: true,
              discount: '10% скидка',
              votes: 0,
            },
            {
              id: `lunch-${i}-2`,
              googlePlaceId: 'ChIJATr1n-Fx5kcRjQb6q6cdQDY',
              name: 'Trattoria Roma',
              type: 'lunch',
              rating: 4.4,
              priceLevel: '$$$',
              distance: '600m',
              duration: '9 мин',
              address: 'Boulevard Haussmann, 78',
              isOpen: true,
              votes: 0,
            },
          ],
        },
        {
          time: '15:00',
          type: 'activity',
          title: 'Активность',
          options: [
            {
              id: `activity-${i}-1`,
              googlePlaceId: 'ChIJD3uTd9hx5kcR1IQvGfr8dbk',
              name: 'Пешеходная экскурсия',
              type: 'walk',
              rating: 4.9,
              priceLevel: '$',
              distance: '200m',
              duration: '3 мин',
              address: 'Place de la Concorde',
              isOpen: true,
              votes: 0,
            },
          ],
        },
        {
          time: '19:00',
          type: 'dinner',
          title: 'Ужин',
          options: [
            {
              id: `dinner-${i}-1`,
              googlePlaceId: 'ChIJG8l_HPNX5kcRZJn5GUQu-N4',
              name: 'La Grande Table',
              type: 'dinner',
              rating: 4.7,
              priceLevel: '$$$',
              distance: '700m',
              duration: '10 мин',
              address: 'Avenue Montaigne, 56',
              isOpen: true,
              votes: 0,
            },
            {
              id: `dinner-${i}-2`,
              googlePlaceId: 'ChIJG8l_HPNX5kcRZJn5GUQu-N5',
              name: 'Sunset Lounge',
              type: 'dinner',
              rating: 4.5,
              priceLevel: '$$',
              distance: '900m',
              duration: '12 мин',
              address: 'Quai de Seine, 12',
              isOpen: true,
              votes: 0,
            },
          ],
        },
      ];

      days.push({
        dayNumber: i + 1,
        date: date.toISOString().split('T')[0],
        slots,
      });
    }

    // Create destination city object for the plan
    const destinationCityInfo: DestinationCity = {
      id: destinationCity.id,
      name: destinationCity.name,
      country: destinationCity.country,
      lat: destinationCity.lat,
      lng: destinationCity.lng,
    };

    return {
      id: `plan-${Date.now()}`,
      userId: 'user-1',
      title: `Путешествие в ${destinationCity.nameRu}`,
      destination: destinationCity.nameRu,
      destinationCity: destinationCityInfo,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + numDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      days,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
  };

  const handleViewPlan = () => {
    if (generatedPlan) {
      navigation.replace('DayView', { dayIndex: 0, plan: generatedPlan });
    }
  };

  const handleRetry = () => {
    setStep('preparing');
    setProgress(0);
    setErrorMessage('');
    generatePlan();
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const currentStepInfo = STEP_MESSAGES[step];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[
          styles.emojiContainer,
          {
            transform: [
              { rotate: step !== 'done' && step !== 'error' ? spin : '0deg' },
              { scale: scaleAnim },
            ],
          },
        ]}>
          <Text style={styles.emoji}>{currentStepInfo.emoji}</Text>
        </Animated.View>

        <Text style={styles.title}>{currentStepInfo.text}</Text>
        
        {step !== 'done' && step !== 'error' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        {step === 'error' && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {step === 'done' && generatedPlan && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Создан маршрут на {generatedPlan.days.length} дней
            </Text>
            <Text style={styles.destinationText}>
              📍 {generatedPlan.destination}
            </Text>
            
            {/* Route Statistics */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>📍</Text>
                <Text style={styles.statValue}>{routeStats.placesCount}</Text>
                <Text style={styles.statLabel}>мест</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>🚶</Text>
                <Text style={styles.statValue}>{routeStats.totalDistance}</Text>
                <Text style={styles.statLabel}>ходьбы</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>⏱️</Text>
                <Text style={styles.statValue}>{routeStats.estimatedTime}</Text>
                <Text style={styles.statLabel}>в пути</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>💰</Text>
                <Text style={styles.statValue}>{routeStats.estimatedCost}</Text>
                <Text style={styles.statLabel}>примерно</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {step === 'done' && (
          <Button
            title="Посмотреть маршрут 🗺️"
            onPress={handleViewPlan}
            variant="accent"
            size="lg"
            fullWidth
          />
        )}
        {step === 'error' && (
          <>
            <Button
              title="Попробовать снова"
              onPress={handleRetry}
              variant="accent"
              size="lg"
              fullWidth
              style={styles.retryButton}
            />
            <Button
              title="Вернуться"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="lg"
              fullWidth
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  successText: {
    fontSize: FontSize.lg,
    color: Colors.success,
    fontWeight: '600',
  },
  destinationText: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '22%',
    padding: Spacing.sm,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  retryButton: {
    marginBottom: Spacing.sm,
  },
});

