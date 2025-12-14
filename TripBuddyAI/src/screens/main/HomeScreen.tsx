import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { RootStackParamList, TripPlan } from '../../types';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: Props) {
  const { state, setLocation } = useApp();
  const [locationName, setLocationName] = useState('Определяем...');
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [weather, setWeather] = useState('☀️ 22°');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = useCallback(async () => {
    setLocationStatus('loading');
    setLocationName('Определяем GPS...');
    
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('📍 [Home] Location permission denied');
        setLocationName('Доступ к GPS запрещён');
        setLocationStatus('error');
        return;
      }

      console.log('📍 [Home] Getting GPS location...');
      
      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.High,
      });

      const gpsLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      
      console.log('📍 [Home] GPS location received:', gpsLocation);
      setLocation(gpsLocation);
      setLocationStatus('success');

      // Get address from coordinates
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (address) {
          const city = address.city || address.subregion || address.region || 'Локация';
          const country = address.country || '';
          setLocationName(`${city}, ${country}`);
          console.log('📍 [Home] Address:', city, country);
        } else {
          setLocationName(`${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}`);
        }
      } catch (geocodeError) {
        console.log('📍 [Home] Geocode error:', geocodeError);
        setLocationName(`GPS: ${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error('📍 [Home] Location error:', error);
      setLocationName('Ошибка GPS');
      setLocationStatus('error');
    }
  }, [setLocation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await requestLocation();
    setRefreshing(false);
  }, [requestLocation]);

  const handleGeneratePlan = () => {
    navigation.navigate('SelectCountry');
  };

  const handleOpenMap = () => {
    // Open map in explore mode - uses current GPS location
    navigation.navigate('Map', { mode: 'explore' });
  };

  const handleOpenProfile = () => {
    navigation.navigate('Profile');
  };

  const handleOpenTripHistory = () => {
    navigation.navigate('TripHistory');
  };

  const renderRecentTrip = (trip: TripPlan, index: number) => (
    <TouchableOpacity 
      key={trip.id || index}
      onPress={() => navigation.navigate('PlanDetails', { planId: trip.id })}
      activeOpacity={0.8}
    >
      <Card style={styles.tripCard} variant="elevated">
        <View style={styles.tripHeader}>
          <Text style={styles.tripDestination} numberOfLines={1} ellipsizeMode="tail">
            {trip.destination}
          </Text>
          <Text style={styles.tripStatus}>
            {trip.status === 'active' ? '🟢' : trip.status === 'completed' ? '✅' : '📝'}
          </Text>
        </View>
        <Text style={styles.tripDates} numberOfLines={1}>
          {trip.days.length} дней • {trip.startDate}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Привет! 👋</Text>
            <TouchableOpacity onPress={requestLocation} style={styles.locationRow}>
              <Text style={styles.locationIcon}>
                {locationStatus === 'loading' ? '⏳' : locationStatus === 'success' ? '📍' : '❌'}
              </Text>
              <Text style={styles.location} numberOfLines={1}>{locationName}</Text>
              {locationStatus === 'success' && <Text style={styles.gpsIndicator}>🟢</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleOpenProfile} style={styles.avatarButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Weather & Quick Info */}
        <View style={styles.infoRow}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoEmoji}>{weather.split(' ')[0]}</Text>
            <Text style={styles.infoValue}>{weather.split(' ')[1]}</Text>
            <Text style={styles.infoLabel}>Погода</Text>
          </Card>
          <Card style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🎯</Text>
            <Text style={styles.infoValue}>{state.tripHistory.length}</Text>
            <Text style={styles.infoLabel}>Поездок</Text>
          </Card>
          <Card style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⭐</Text>
            <Text style={styles.infoValue}>{state.preferences.interests.length}</Text>
            <Text style={styles.infoLabel}>Интересов</Text>
          </Card>
        </View>

        {/* Main CTA */}
        <View style={styles.ctaContainer}>
          <View style={styles.ctaBackground}>
            <Text style={styles.ctaEmoji}>✨</Text>
            <Text style={styles.ctaTitle}>Готов к приключениям?</Text>
            <Text style={styles.ctaSubtitle}>
              ИИ создаст персональный маршрут специально для тебя
            </Text>
            <Button
              title="Создать маршрут 🚀"
              onPress={handleGeneratePlan}
              variant="accent"
              size="lg"
              fullWidth
              style={styles.ctaButton}
            />
          </View>
        </View>

        {/* Map Preview */}
        <TouchableOpacity onPress={handleOpenMap} activeOpacity={0.8}>
          <Card style={styles.mapPreview} variant="elevated">
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapEmoji}>🗺️</Text>
              <Text style={styles.mapText}>Открыть карту</Text>
            </View>
            <Text style={styles.mapHint}>
              Посмотри рекомендации рядом с тобой
            </Text>
          </Card>
        </TouchableOpacity>

        {/* My Routes Button */}
        <TouchableOpacity onPress={handleOpenTripHistory} activeOpacity={0.8}>
          <Card style={styles.myRoutesCard} variant="elevated">
            <View style={styles.myRoutesContent}>
              <View style={styles.myRoutesLeft}>
                <Text style={styles.myRoutesEmoji}>📋</Text>
                <View>
                  <Text style={styles.myRoutesTitle}>Мои маршруты</Text>
                  <Text style={styles.myRoutesSubtitle}>
                    {state.tripHistory.length} {state.tripHistory.length === 1 ? 'маршрут' : 'маршрутов'}
                  </Text>
                </View>
              </View>
              <Text style={styles.myRoutesArrow}>→</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Recent Trips */}
        {state.tripHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Последние маршруты</Text>
            {state.tripHistory.slice(0, 3).map((trip, index) => 
              renderRecentTrip(trip, index)
            )}
          </View>
        )}

        {/* Preferences Summary */}
        <Card style={styles.preferencesCard} variant="outlined">
          <View style={styles.preferencesHeader}>
            <Text style={styles.preferencesTitle}>Твои предпочтения</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditPreferences')}>
              <Text style={styles.editLink}>Изменить</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.preferencesContent}>
            <Text style={styles.preferencesItem}>
              🌍 {state.preferences.countries.length} стран
            </Text>
            <Text style={styles.preferencesItem}>
              🍽️ {state.preferences.cuisines.length} кухонь
            </Text>
            <Text style={styles.preferencesItem}>
              📅 {state.preferences.days} дней
            </Text>
            <Text style={styles.preferencesItem}>
              💰 {state.preferences.budget === 'low' ? 'Бюджетный' : 
                   state.preferences.budget === 'medium' ? 'Средний' : 'Премиум'}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    maxWidth: width * 0.6,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  location: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  gpsIndicator: {
    fontSize: 8,
    marginLeft: 4,
  },
  avatarButton: {
    padding: Spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  avatarText: {
    fontSize: 24,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  infoEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ctaContainer: {
    marginBottom: Spacing.lg,
  },
  ctaBackground: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  ctaEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  ctaTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  ctaSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
  },
  mapPreview: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  mapEmoji: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  mapText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  mapHint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  myRoutesCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  myRoutesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myRoutesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  myRoutesEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  myRoutesTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  myRoutesSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  myRoutesArrow: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  tripCard: {
    marginBottom: Spacing.sm,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDestination: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  tripStatus: {
    fontSize: 16,
  },
  tripDates: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  preferencesCard: {
    marginBottom: Spacing.lg,
  },
  preferencesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  preferencesTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  editLink: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  preferencesContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  preferencesItem: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
});

