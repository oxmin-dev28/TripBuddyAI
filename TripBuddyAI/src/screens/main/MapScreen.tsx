import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { RootStackParamList, PlaceOption, Location as LocationType } from '../../types';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Map'>;
  route: RouteProp<RootStackParamList, 'Map'>;
};

const PLACE_FILTERS = [
  { id: 'all', label: 'Все', emoji: '📍' },
  { id: 'restaurant', label: 'Рестораны', emoji: '🍽️' },
  { id: 'museum', label: 'Музеи', emoji: '🏛️' },
  { id: 'attraction', label: 'Места', emoji: '🎯' },
  { id: 'park', label: 'Парки', emoji: '🌳' },
  { id: 'shopping', label: 'Шопинг', emoji: '🛍️' },
  { id: 'nightlife', label: 'Клубы', emoji: '🎉' },
];

export function MapScreen({ navigation, route }: Props) {
  const { state, setLocation } = useApp();
  const mapRef = useRef<MapView>(null);
  const scrollRef = useRef<ScrollView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState<PlaceOption | null>(null);
  const [places, setPlaces] = useState<PlaceOption[]>(route.params?.places || []);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<string>('Определяем локацию...');
  const [currentGpsLocation, setCurrentGpsLocation] = useState<LocationType | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [loadedRegions, setLoadedRegions] = useState<Set<string>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Check if we're in route mode (viewing destination) or explore mode (current GPS location)
  const isRouteMode = route.params?.mode === 'route' && route.params?.destination;
  const destination = route.params?.destination;
  
  // Get user preferences from state
  const userPreferences = state.preferences;

  // Request and track GPS location
  const startLocationTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Разрешите доступ к геолокации для показа мест рядом');
        setApiStatus('❌ Нет доступа к геолокации');
        return null;
      }

      // Get current position first
      setApiStatus('📡 Определяем вашу позицию...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const gpsLocation: LocationType = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      
      setCurrentGpsLocation(gpsLocation);
      setLocation(gpsLocation);
      
      console.log('📍 [MapScreen] GPS Location:', gpsLocation);

      // Start watching location for real-time updates
      if (!isRouteMode) {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 50, // Or when moved 50 meters
          },
          (newLocation) => {
            const newGpsLocation: LocationType = {
              lat: newLocation.coords.latitude,
              lng: newLocation.coords.longitude,
            };
            console.log('📍 [MapScreen] Location updated:', newGpsLocation);
            setCurrentGpsLocation(newGpsLocation);
            setLocation(newGpsLocation);
          }
        );
        locationSubscription.current = subscription;
        setIsTrackingLocation(true);
      }

      return gpsLocation;
    } catch (error) {
      console.error('❌ [MapScreen] Location error:', error);
      setApiStatus('❌ Ошибка геолокации');
      return null;
    }
  }, [isRouteMode, setLocation]);

  // Cleanup location tracking
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  // Determine which location to use for the map
  const getMapLocation = useCallback((): LocationType => {
    if (isRouteMode && destination) {
      // Route mode: use destination coordinates
      return { lat: destination.lat, lng: destination.lng };
    }
    // Explore mode: use current GPS location
    if (currentGpsLocation) {
      return currentGpsLocation;
    }
    // Fallback to state location or Paris
    return state.currentLocation || { lat: 48.8566, lng: 2.3522 };
  }, [isRouteMode, destination, currentGpsLocation, state.currentLocation]);

  const mapLocation = getMapLocation();
  
  // Get location name for header
  const getLocationName = (): string => {
    if (isRouteMode && destination) {
      return destination.name;
    }
    return 'Рядом с вами';
  };

  console.log('🗺️ [MapScreen] Mode:', isRouteMode ? 'ROUTE' : 'EXPLORE', {
    locationName: getLocationName(),
    lat: mapLocation.lat,
    lng: mapLocation.lng,
    tracking: isTrackingLocation,
  });

  // Calculate radius based on map zoom level (latitudeDelta)
  const calculateRadiusFromDelta = (latitudeDelta: number): number => {
    // latitudeDelta represents the vertical span of the map
    // 1 degree of latitude ≈ 111 km
    // We want radius to cover the visible area
    const kmPerDegree = 111;
    const visibleKm = latitudeDelta * kmPerDegree;
    const radiusKm = visibleKm * 0.6; // 60% of visible area
    const radiusMeters = Math.min(Math.max(radiusKm * 1000, 1000), 50000); // 1km to 50km
    return Math.round(radiusMeters);
  };

  // Create a unique key for a region (for caching)
  const getRegionKey = (lat: number, lng: number, radius: number): string => {
    // Round to 3 decimals for grouping nearby requests
    const latRounded = Math.round(lat * 1000) / 1000;
    const lngRounded = Math.round(lng * 1000) / 1000;
    const radiusRounded = Math.round(radius / 1000); // km
    return `${latRounded},${lngRounded},${radiusRounded}`;
  };

  // Calculate marker size based on zoom level
  const getMarkerSize = (latitudeDelta: number): number => {
    // More zoomed in (smaller delta) = larger markers
    // More zoomed out (larger delta) = smaller markers
    if (latitudeDelta < 0.01) return 40; // Very close zoom
    if (latitudeDelta < 0.03) return 36; // Close zoom
    if (latitudeDelta < 0.08) return 32; // Medium zoom
    if (latitudeDelta < 0.15) return 28; // Far zoom
    return 24; // Very far zoom
  };

  // Get marker font size
  const getMarkerFontSize = (latitudeDelta: number): number => {
    if (latitudeDelta < 0.01) return 20;
    if (latitudeDelta < 0.03) return 18;
    if (latitudeDelta < 0.08) return 16;
    if (latitudeDelta < 0.15) return 14;
    return 12;
  };

  // Fetch ALL places from API without limits
  const fetchPlaces = useCallback(async (
    type: string = 'all', 
    location?: LocationType,
    radius?: number,
    shouldAppend: boolean = false
  ) => {
    const targetLocation = location || mapLocation;
    const targetRadius = radius || 5000;
    
    if (!shouldAppend) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    console.log(`🗺️ [MapScreen] Fetching places:`, {
      mode: isRouteMode ? 'ROUTE' : 'EXPLORE',
      type,
      location: `${targetLocation.lat.toFixed(4)},${targetLocation.lng.toFixed(4)}`,
      radius: `${targetRadius}m`,
      append: shouldAppend,
      cuisines: userPreferences.cuisines,
      budget: userPreferences.budget,
    });
    
    try {
      const response = await api.getNearbyPlaces(
        targetLocation.lat, 
        targetLocation.lng, 
        type === 'all' ? undefined : type,
        {
          cuisines: userPreferences.cuisines,
          budget: userPreferences.budget,
          interests: userPreferences.interests,
          radius: targetRadius,
        }
      );
      
      console.log(`📍 [MapScreen] API Response:`, {
        success: response.success,
        placesCount: response.data?.length || 0,
        error: response.error,
      });
      
      if (response.success && response.data) {
        if (shouldAppend) {
          // Append new places, remove duplicates by ID
          setPlaces(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPlaces = response.data!.filter(p => !existingIds.has(p.id));
            const combined = [...prev, ...newPlaces];
            
            // Additional deduplication using Map (in case of any issues)
            const uniqueMap = new Map(combined.map(p => [p.id, p]));
            const uniquePlaces = Array.from(uniqueMap.values());
            
            console.log(`➕ [MapScreen] Added ${newPlaces.length} new places (${uniquePlaces.length} total unique)`);
            return uniquePlaces;
          });
        } else {
          // Replace mode - also ensure uniqueness
          const uniqueMap = new Map(response.data.map(p => [p.id, p]));
          const uniquePlaces = Array.from(uniqueMap.values());
          setPlaces(uniquePlaces);
          console.log(`🔄 [MapScreen] Replaced with ${uniquePlaces.length} unique places`);
        }
        
        const budgetLabel = userPreferences.budget === 'low' ? '💰' : 
                          userPreferences.budget === 'high' ? '💎' : '💵';
        const modeLabel = isRouteMode ? '🎯' : '📍';
        const locationLabel = isRouteMode ? getLocationName() : 'рядом с вами';
        setApiStatus(`${modeLabel} ${places.length} мест ${locationLabel} ${budgetLabel}`);
      } else {
        console.error('❌ [MapScreen] API Error:', response.error);
        setApiStatus(`❌ Ошибка: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ [MapScreen] Fetch error:', error);
      setApiStatus(`❌ Ошибка сети`);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [mapLocation, userPreferences, isRouteMode, places]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (route.params?.places && route.params.places.length > 0) {
        console.log('📍 [MapScreen] Using passed places:', route.params.places.length);
        setPlaces(route.params.places);
        setIsLoading(false);
        setApiStatus(`📍 ${route.params.places.length} мест из маршрута`);
        return;
      }

      if (isRouteMode) {
        // Route mode: fetch places for destination
        fetchPlaces('all');
      } else {
        // Explore mode: get GPS first, then fetch places
        const gpsLocation = await startLocationTracking();
        if (gpsLocation) {
          fetchPlaces('all', gpsLocation);
        }
      }
    };

    init();
  }, []);

  // Refetch when GPS location changes significantly (in explore mode)
  useEffect(() => {
    if (!isRouteMode && currentGpsLocation && !isLoading) {
      // Only refetch if location changed significantly (more than 100m)
      const shouldRefetch = true; // For simplicity, always fetch on location change
      if (shouldRefetch) {
        fetchPlaces(activeFilter, currentGpsLocation);
      }
    }
  }, [currentGpsLocation?.lat, currentGpsLocation?.lng]);

  // Filter change handler
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setSelectedPlace(null);
    fetchPlaces(filterId);
  };

  // Recenter map on current location
  const handleRecenterMap = async () => {
    if (isRouteMode) {
      mapRef.current?.animateToRegion({
        latitude: destination!.lat,
        longitude: destination!.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    } else {
      const gpsLocation = await startLocationTracking();
      if (gpsLocation) {
        mapRef.current?.animateToRegion({
          latitude: gpsLocation.lat,
          longitude: gpsLocation.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 500);
        fetchPlaces(activeFilter, gpsLocation);
      }
    }
  };

  // Filter places by type (client-side filtering for passed places)
  const filteredPlaces = places.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'restaurant') {
      return ['restaurant', 'cafe', 'bakery'].includes(p.type);
    }
    return p.type === activeFilter;
  });

  const handleMarkerPress = (place: PlaceOption) => {
    setSelectedPlace(place);
    
    // Animate to place location
    if (place.location) {
      mapRef.current?.animateToRegion({
        latitude: place.location.lat,
        longitude: place.location.lng,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }, 500);
    }
    
    // Scroll to place card
    const index = filteredPlaces.findIndex(p => p.id === place.id);
    if (index !== -1 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: index * (width * 0.7 + Spacing.md), animated: true });
    }
  };

  const handlePlaceCardPress = (place: PlaceOption) => {
    setSelectedPlace(place);
    
    if (place.location) {
      mapRef.current?.animateToRegion({
        latitude: place.location.lat,
        longitude: place.location.lng,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }, 500);
    }
  };

  // Handle map region change (zoom/pan)
  const handleRegionChangeComplete = useCallback((region: Region) => {
    console.log('🗺️ [MapScreen] Region changed:', {
      lat: region.latitude.toFixed(4),
      lng: region.longitude.toFixed(4),
      delta: region.latitudeDelta.toFixed(4),
    });

    setCurrentRegion(region);

    // Calculate radius based on zoom level
    const radius = calculateRadiusFromDelta(region.latitudeDelta);
    const regionKey = getRegionKey(region.latitude, region.longitude, radius);

    // Check if we already loaded this region
    if (loadedRegions.has(regionKey)) {
      console.log('✅ [MapScreen] Region already loaded:', regionKey);
      return;
    }

    // Mark region as loaded
    setLoadedRegions(prev => new Set(prev).add(regionKey));

    // Fetch places for new region
    const newLocation: LocationType = {
      lat: region.latitude,
      lng: region.longitude,
    };

    // Append new places instead of replacing
    console.log(`🔄 [MapScreen] Loading places for new region (${radius}m)...`);
    fetchPlaces(activeFilter, newLocation, radius, true);
  }, [activeFilter, loadedRegions, calculateRadiusFromDelta, getRegionKey, fetchPlaces]);

  const getMarkerEmoji = (type: string) => {
    switch (type) {
      case 'restaurant':
      case 'cafe':
      case 'bakery':
        return '🍽️';
      case 'museum':
        return '🏛️';
      case 'attraction':
        return '🎯';
      case 'park':
        return '🌳';
      case 'shopping':
        return '🛍️';
      case 'nightlife':
        return '🎉';
      default:
        return '📍';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isRouteMode ? '🎯' : '📍'} {getLocationName()}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isRouteMode ? 'Маршрут' : isTrackingLocation ? '🟢 GPS активен' : 'Рядом'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRecenterMap}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* API Status */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{apiStatus}</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {PLACE_FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => handleFilterChange(filter.id)}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.filterChipActive,
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.filterEmoji}>{filter.emoji}</Text>
              <Text style={[
                styles.filterLabel,
                activeFilter === filter.id && styles.filterLabelActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Загрузка мест...</Text>
          </View>
        )}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: mapLocation.lat,
            longitude: mapLocation.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass
          showsScale
          followsUserLocation={!isRouteMode}
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {/* Place markers with real coordinates */}
          {filteredPlaces.map((place) => {
            // Only show markers with valid locations
            if (!place.location?.lat || !place.location?.lng) return null;
            
            // Different colors for places matching/not matching preferences
            const matchesPrefs = place.matchesPreferences !== false;
            
            // Dynamic marker size based on zoom
            const markerSize = currentRegion ? getMarkerSize(currentRegion.latitudeDelta) : 36;
            const fontSize = currentRegion ? getMarkerFontSize(currentRegion.latitudeDelta) : 18;
            
            return (
              <Marker
                key={`marker-${place.id}`}
                coordinate={{ 
                  latitude: place.location.lat, 
                  longitude: place.location.lng 
                }}
                title={place.name}
                description={`${place.rating}⭐ • ${place.priceLevel} • ${place.distance}`}
                onPress={() => handleMarkerPress(place)}
                tracksViewChanges={false}
              >
                <View style={[
                  styles.placeMarker,
                  { width: markerSize, height: markerSize, borderRadius: markerSize / 4 },
                  selectedPlace?.id === place.id && styles.selectedMarker,
                  !matchesPrefs && styles.notMatchingMarker,
                ]}>
                  <Text style={[styles.markerEmoji, { fontSize }]}>{getMarkerEmoji(place.type)}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* Places count badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {filteredPlaces.length} мест
          </Text>
          {filteredPlaces.some(p => p.matchesPreferences === false) && (
            <Text style={styles.matchingCountText}>
              {' '}• {filteredPlaces.filter(p => p.matchesPreferences !== false).length} 💚
            </Text>
          )}
          {isLoadingMore && (
            <Text style={styles.loadingMoreText}> 🔄</Text>
          )}
        </View>

        {/* Recenter button */}
        <TouchableOpacity 
          style={styles.recenterButton}
          onPress={handleRecenterMap}
        >
          <Text style={styles.recenterIcon}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Places list */}
      <View style={styles.placesListContainer}>
        <View style={styles.placesHeader}>
          <Text style={styles.placesTitle}>
            {activeFilter === 'all' ? 'Все места' : PLACE_FILTERS.find(f => f.id === activeFilter)?.label}
          </Text>
          <Text style={styles.placesCount}>{filteredPlaces.length}</Text>
        </View>
        
        {filteredPlaces.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Загрузка...' : 'Нет мест в этой категории'}
            </Text>
          </View>
        ) : (
          <ScrollView 
            ref={scrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placesList}
            snapToInterval={width * 0.7 + Spacing.md}
            decelerationRate="fast"
          >
            {filteredPlaces.map(place => (
              <TouchableOpacity
                key={`card-${place.id}`}
                onPress={() => handlePlaceCardPress(place)}
                activeOpacity={0.8}
              >
                <Card 
                  style={
                    selectedPlace?.id === place.id 
                      ? [styles.placeCard, styles.selectedPlaceCard] 
                      : styles.placeCard
                  }
                  variant={selectedPlace?.id === place.id ? 'elevated' : 'default'}
                >
                  <View style={styles.placeCardHeader}>
                    <View style={styles.placeTypeIcon}>
                      <Text>{getMarkerEmoji(place.type)}</Text>
                    </View>
                    <View style={styles.placeNameContainer}>
                      <Text style={styles.placeName} numberOfLines={1}>
                        {place.matchesPreferences !== false && '💚 '}{place.name}
                      </Text>
                      <Text style={styles.placeAddress} numberOfLines={1}>
                        {place.address}
                      </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingStar}>⭐</Text>
                      <Text style={styles.ratingText}>{place.rating?.toFixed(1)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.placeInfo}>
                    <View style={styles.infoChip}>
                      <Text style={styles.infoChipText}>📍 {place.distance}</Text>
                    </View>
                    <View style={styles.infoChip}>
                      <Text style={styles.infoChipText}>💰 {place.priceLevel}</Text>
                    </View>
                    <View style={styles.infoChip}>
                      <Text style={styles.infoChipText}>🚶 {place.duration}</Text>
                    </View>
                    {place.isOpen !== undefined && (
                      <View style={[styles.infoChip, place.isOpen ? styles.openChip : styles.closedChip]}>
                        <Text style={styles.infoChipText}>
                          {place.isOpen ? '🟢 Открыто' : '🔴 Закрыто'}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {place.discount && (
                    <View style={styles.discountBanner}>
                      <Text style={styles.discountText}>🎁 {place.discount}</Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: 20,
  },
  statusBar: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: Colors.textOnPrimary,
    textAlign: 'center',
  },
  filtersWrapper: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceAlt,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: Colors.textOnPrimary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  countBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  countText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  matchingCountText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    opacity: 0.9,
  },
  loadingMoreText: {
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
  },
  recenterButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  recenterIcon: {
    fontSize: 22,
  },
  placeMarker: {
    // Size is dynamic, set inline
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  selectedMarker: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
    transform: [{ scale: 1.15 }],
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  notMatchingMarker: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.border,
    opacity: 0.5,
  },
  markerEmoji: {
    // Font size is dynamic, set inline
  },
  placesListContainer: {
    backgroundColor: Colors.surface,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    maxHeight: 200,
  },
  placesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  placesTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placesCount: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  placesList: {
    paddingHorizontal: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  placeCard: {
    width: width * 0.7,
    marginRight: Spacing.md,
    padding: Spacing.md,
  },
  selectedPlaceCard: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  placeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  placeTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  placeNameContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  placeName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeAddress: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  infoChip: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  openChip: {
    backgroundColor: Colors.success + '20',
  },
  closedChip: {
    backgroundColor: Colors.error + '20',
  },
  infoChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  discountBanner: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: FontSize.xs,
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
});
