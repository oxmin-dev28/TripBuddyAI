"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNearbyPlaces = searchNearbyPlaces;
exports.getPlaceDetails = getPlaceDetails;
exports.testGooglePlacesApi = testGooglePlacesApi;
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const parisPlaces_1 = require("../data/parisPlaces");
const client = new google_maps_services_js_1.Client({});
const PLACE_TYPE_MAP = {
    restaurant: [google_maps_services_js_1.PlaceType1.restaurant, google_maps_services_js_1.PlaceType1.cafe],
    cafe: [google_maps_services_js_1.PlaceType1.cafe, google_maps_services_js_1.PlaceType1.bakery],
    museum: [google_maps_services_js_1.PlaceType1.museum],
    attraction: [google_maps_services_js_1.PlaceType1.tourist_attraction],
    shopping: [google_maps_services_js_1.PlaceType1.shopping_mall, google_maps_services_js_1.PlaceType1.store],
    nightlife: [google_maps_services_js_1.PlaceType1.night_club, google_maps_services_js_1.PlaceType1.bar],
    park: [google_maps_services_js_1.PlaceType1.park],
};
async function searchNearbyPlaces(params) {
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
        const places = (0, parisPlaces_1.getParisPlacesWithDistance)(location.lat, location.lng, type);
        console.log(`✅ [GooglePlaces] Returning ${places.length} mock places for type: ${type}`);
        return places;
    }
    // Use real Google Places API
    try {
        console.log('🌐 [GooglePlaces] Calling Google Places API...');
        const placeTypes = PLACE_TYPE_MAP[type] || [google_maps_services_js_1.PlaceType1.tourist_attraction];
        const response = await client.placesNearby({
            params: {
                location: `${location.lat},${location.lng}`,
                radius,
                type: placeTypes[0],
                keyword,
                key: process.env.GOOGLE_PLACES_API_KEY,
            },
        });
        console.log('📊 [GooglePlaces] API Response status:', response.data.status);
        console.log('📊 [GooglePlaces] Results count:', response.data.results?.length || 0);
        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            console.error('❌ [GooglePlaces] API Error:', response.data.status, response.data.error_message);
            // Fallback to mock data on error
            return (0, parisPlaces_1.getParisPlacesWithDistance)(location.lat, location.lng, type);
        }
        const places = response.data.results || [];
        // Return ALL places - no limit
        const mappedPlaces = places.map((place) => {
            const distance = (0, parisPlaces_1.calculateDistance)(location.lat, location.lng, place.geometry?.location.lat || 0, place.geometry?.location.lng || 0);
            return {
                id: place.place_id || `place-${Math.random()}`,
                googlePlaceId: place.place_id || '',
                name: place.name || 'Unknown Place',
                type: type,
                rating: place.rating || 4.0,
                priceLevel: getPriceLevel(place.price_level),
                distance: (0, parisPlaces_1.formatDistance)(distance),
                duration: (0, parisPlaces_1.formatDuration)(distance),
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
        console.log(`✅ [GooglePlaces] Returning ${mappedPlaces.length} real places from API`);
        return mappedPlaces;
    }
    catch (error) {
        console.error('❌ [GooglePlaces] API Exception:', error);
        console.log('⚠️ [GooglePlaces] Falling back to mock data');
        return (0, parisPlaces_1.getParisPlacesWithDistance)(location.lat, location.lng, type);
    }
}
async function getPlaceDetails(placeId) {
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
    }
    catch (error) {
        console.error('❌ [GooglePlaces] Place details error:', error);
        return null;
    }
}
function getPriceLevel(level) {
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
async function testGooglePlacesApi() {
    console.log('🧪 [GooglePlaces] Testing API connection...');
    if (!process.env.GOOGLE_PLACES_API_KEY) {
        return { working: false, message: 'No API key configured - using mock data' };
    }
    try {
        const response = await client.placesNearby({
            params: {
                location: '48.8566,2.3522', // Paris
                radius: 1000,
                type: google_maps_services_js_1.PlaceType1.restaurant,
                key: process.env.GOOGLE_PLACES_API_KEY,
            },
        });
        if (response.data.status === 'OK') {
            return {
                working: true,
                message: `API working! Found ${response.data.results?.length || 0} places`
            };
        }
        else {
            return {
                working: false,
                message: `API error: ${response.data.status} - ${response.data.error_message || 'Unknown'}`
            };
        }
    }
    catch (error) {
        return {
            working: false,
            message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
//# sourceMappingURL=googlePlaces.js.map