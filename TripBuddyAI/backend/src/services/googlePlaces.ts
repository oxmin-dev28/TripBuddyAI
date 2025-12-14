import { Client, PlaceType1 } from '@googlemaps/google-maps-services-js';
import { Location, PlaceOption } from '../types';
import { getParisPlacesWithDistance, calculateDistance, formatDistance, formatDuration } from '../data/parisPlaces';

const client = new Client({});

const PLACE_TYPE_MAP: Record<string, PlaceType1[]> = {
  restaurant: [PlaceType1.restaurant, PlaceType1.cafe],
  cafe: [PlaceType1.cafe, PlaceType1.bakery],
  museum: [PlaceType1.museum],
  attraction: [PlaceType1.tourist_attraction],
  shopping: [PlaceType1.shopping_mall, PlaceType1.store],
  nightlife: [PlaceType1.night_club, PlaceType1.bar],
  park: [PlaceType1.park],
};

interface NearbySearchParams {
  location: Location;
  type?: string;
  radius?: number;
  keyword?: string;
}

export async function searchNearbyPlaces(params: NearbySearchParams): Promise<PlaceOption[]> {
  const { location, type = 'all', radius = 5000, keyword } = params;
  
  console.log('🔍 [GooglePlaces] searchNearbyPlaces called:', {
    location: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
    type,
    radius,
    keyword,
    hasApiKey: !!process.env.GOOGLE_PLACES_API_KEY,
  });
  
  // If no API key, use rich Paris mock data
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.log('⚠️ [GooglePlaces] No API key, using Paris mock data (53 places)');
    const places = getParisPlacesWithDistance(location.lat, location.lng, type);
    console.log(`✅ [GooglePlaces] Returning ${places.length} mock places for type: ${type}`);
    return places;
  }

  // Use real Google Places API
  try {
    console.log('🌐 [GooglePlaces] Calling Google Places API...');
    
    // If type is "all", fetch multiple types in parallel
    if (type === 'all') {
      console.log('📍 [GooglePlaces] Fetching ALL place types...');
      const allTypesToFetch = [
        PlaceType1.restaurant,
        PlaceType1.tourist_attraction,
        PlaceType1.museum,
        PlaceType1.park,
        PlaceType1.shopping_mall,
        PlaceType1.cafe,
      ];
      
      const allPlacesPromises = allTypesToFetch.map(placeType => 
        fetchPlacesWithPagination(location, placeType, radius, keyword)
      );
      
      const allPlacesArrays = await Promise.all(allPlacesPromises);
      const allPlaces = allPlacesArrays.flat();
      
      // Remove duplicates by place_id
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.id, place])).values()
      );
      
      console.log(`✅ [GooglePlaces] Returning ${uniquePlaces.length} unique places (from ${allPlaces.length} total)`);
      return uniquePlaces;
    }
    
    // Single type - fetch with pagination
    const placeTypes = PLACE_TYPE_MAP[type] || [PlaceType1.tourist_attraction];
    const places = await fetchPlacesWithPagination(location, placeTypes[0], radius, keyword);
    
    console.log(`✅ [GooglePlaces] Returning ${places.length} places for type: ${type}`);
    return places;
  } catch (error) {
    console.error('❌ [GooglePlaces] API Exception:', error);
    console.log('⚠️ [GooglePlaces] Falling back to mock data');
    return getParisPlacesWithDistance(location.lat, location.lng, type);
  }
}

// Helper function to fetch places with pagination
async function fetchPlacesWithPagination(
  location: Location,
  placeType: PlaceType1,
  radius: number,
  keyword?: string,
  maxPages: number = 3 // Max 60 places per type (20 * 3)
): Promise<PlaceOption[]> {
  const allPlaces: PlaceOption[] = [];
  let nextPageToken: string | undefined = undefined;
  let pageCount = 0;

  do {
    try {
      // Wait 2 seconds before fetching next page (Google API requirement)
      if (nextPageToken && pageCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const response = await client.placesNearby({
        params: {
          location: `${location.lat},${location.lng}`,
          radius,
          type: placeType,
          keyword,
          key: process.env.GOOGLE_PLACES_API_KEY!,
          ...(nextPageToken ? { pagetoken: nextPageToken } : {}),
        },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.error(`❌ [GooglePlaces] API Error for ${placeType}:`, response.data.status);
        break;
      }

      const places = response.data.results || [];
      
      const mappedPlaces = places.map((place): PlaceOption => {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          place.geometry?.location.lat || 0,
          place.geometry?.location.lng || 0
        );
        
        return {
          id: place.place_id || `place-${Math.random()}`,
          googlePlaceId: place.place_id || '',
          name: place.name || 'Unknown Place',
          type: getPlaceTypeFromGoogleType(placeType),
          rating: place.rating || 4.0,
          priceLevel: getPriceLevel(place.price_level),
          distance: formatDistance(distance),
          duration: formatDuration(distance),
          address: place.vicinity || '',
          photoUrl: place.photos?.[0]?.photo_reference 
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
            : undefined,
          isOpen: place.opening_hours?.open_now,
          location: {
            lat: place.geometry?.location.lat || 0,
            lng: place.geometry?.location.lng || 0,
          },
        };
      });

      allPlaces.push(...mappedPlaces);
      nextPageToken = response.data.next_page_token;
      pageCount++;

      console.log(`📄 [GooglePlaces] Page ${pageCount} for ${placeType}: ${mappedPlaces.length} places (total: ${allPlaces.length})`);
      
    } catch (error) {
      console.error(`❌ [GooglePlaces] Error fetching page ${pageCount + 1}:`, error);
      break;
    }
  } while (nextPageToken && pageCount < maxPages);

  return allPlaces;
}

// Helper to map Google PlaceType to our app types
function getPlaceTypeFromGoogleType(googleType: PlaceType1): string {
  switch (googleType) {
    case PlaceType1.restaurant:
      return 'restaurant';
    case PlaceType1.cafe:
      return 'cafe';
    case PlaceType1.museum:
      return 'museum';
    case PlaceType1.tourist_attraction:
      return 'attraction';
    case PlaceType1.shopping_mall:
    case PlaceType1.store:
      return 'shopping';
    case PlaceType1.night_club:
    case PlaceType1.bar:
      return 'nightlife';
    case PlaceType1.park:
      return 'park';
    default:
      return 'attraction';
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceOption | null> {
  console.log('🔍 [GooglePlaces] getPlaceDetails called:', { placeId });
  
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.log('⚠️ [GooglePlaces] No API key for place details');
    return null;
  }

  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'price_level', 'photos', 'opening_hours'],
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
    });

    console.log('📊 [GooglePlaces] Place details status:', response.data.status);

    const place = response.data.result;
    
    return {
      id: placeId,
      googlePlaceId: placeId,
      name: place.name || 'Unknown',
      type: 'attraction',
      rating: place.rating || 4.0,
      priceLevel: getPriceLevel(place.price_level),
      distance: '0m',
      duration: '0 мін',
      address: place.formatted_address || '',
      photoUrl: place.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
        : undefined,
      isOpen: place.opening_hours?.open_now,
      location: {
        lat: place.geometry?.location.lat || 0,
        lng: place.geometry?.location.lng || 0,
      },
    };
  } catch (error) {
    console.error('❌ [GooglePlaces] Place details error:', error);
    return null;
  }
}

function getPriceLevel(level?: number): string {
  switch (level) {
    case 0: return '$';
    case 1: return '$';
    case 2: return '$$';
    case 3: return '$$$';
    case 4: return '$$$$';
    default: return '$$';
  }
}

// Export for testing
export async function testGooglePlacesApi(): Promise<{ working: boolean; message: string }> {
  console.log('🧪 [GooglePlaces] Testing API connection...');
  
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return { working: false, message: 'No API key configured - using mock data' };
  }

  try {
    const response = await client.placesNearby({
      params: {
        location: '48.8566,2.3522', // Paris
        radius: 1000,
        type: PlaceType1.restaurant,
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      return { 
        working: true, 
        message: `API working! Found ${response.data.results?.length || 0} places` 
      };
    } else {
      return { 
        working: false, 
        message: `API error: ${response.data.status} - ${response.data.error_message || 'Unknown'}` 
      };
    }
  } catch (error) {
    return { 
      working: false, 
      message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
