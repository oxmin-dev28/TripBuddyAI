import { Router, Request, Response } from 'express';
import { searchNearbyPlaces, getPlaceDetails } from '../services/googlePlaces';
import { updateOpenStatus, filterOpenPlaces, sortPlacesByRelevance } from '../utils/openingHours';

const router = Router();

// GET /api/places
// Accepts: lat, lng, type, radius, keyword, cuisines, budget, interests, time, openOnly
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { lat, lng, type, radius, keyword, cuisines, budget, interests, time, openOnly } = req.query;

    console.log('📍 [API /places] Request:', { 
      lat, lng, type, radius, keyword,
      cuisines, budget, interests, time, openOnly
    });

    if (!lat || !lng) {
      console.log('❌ [API /places] Missing coordinates');
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameters: lat and lng',
      });
    }

    // Parse user preferences
    const userPreferences = {
      cuisines: cuisines ? (cuisines as string).split(',') : [],
      budget: budget as string || 'medium',
      interests: interests ? (interests as string).split(',') : [],
    };

    // Build keyword from preferences for better search
    let searchKeyword = keyword as string || '';
    if (userPreferences.cuisines.length > 0 && (type === 'restaurant' || type === 'all')) {
      searchKeyword = userPreferences.cuisines.slice(0, 2).join(' ') + ' ' + searchKeyword;
    }

    let places = await searchNearbyPlaces({
      location: {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
      },
      type: type as string || 'all',
      radius: radius ? parseInt(radius as string) : 5000,
      keyword: searchKeyword.trim() || undefined,
    });

    // Update open status based on time parameter or current time
    const checkTime = time as string || undefined;
    places = updateOpenStatus(places, checkTime);

    // Filter only open places if requested
    if (openOnly === 'true' && checkTime) {
      places = filterOpenPlaces(places, checkTime);
      console.log(`   Filtered to ${places.length} open places at ${checkTime}`);
    }

    // Sort by relevance (open places first, then by rating)
    if (checkTime) {
      places = sortPlacesByRelevance(places, checkTime);
    }

    // Mark places that match user preferences instead of filtering them out
    const placesWithPreferenceMatch = places.map(place => {
      let matchesPreferences = true;
      
      // Check budget match
      if (userPreferences.budget) {
        const priceLevel = place.priceLevel;
        if (userPreferences.budget === 'low') {
          matchesPreferences = matchesPreferences && (priceLevel === '$' || priceLevel === '$$');
        } else if (userPreferences.budget === 'high') {
          matchesPreferences = matchesPreferences && (priceLevel === '$$$' || priceLevel === '$$$$');
        }
        // medium accepts all
      }
      
      // Check cuisines match (for restaurants/cafes)
      if (userPreferences.cuisines.length > 0 && (type === 'restaurant' || type === 'cafe')) {
        // Simple keyword matching - check if any cuisine appears in place name or address
        const searchText = `${place.name} ${place.address}`.toLowerCase();
        const hasCuisineMatch = userPreferences.cuisines.some(cuisine => 
          searchText.includes(cuisine.toLowerCase())
        );
        matchesPreferences = matchesPreferences && hasCuisineMatch;
      }
      
      return {
        ...place,
        matchesPreferences,
      };
    });

    // Count how many match preferences
    const matchingCount = placesWithPreferenceMatch.filter(p => p.matchesPreferences).length;

    const duration = Date.now() - startTime;
    console.log(`✅ [API /places] Returning ${placesWithPreferenceMatch.length} places (${matchingCount} match preferences) in ${duration}ms`);

    res.json({
      success: true,
      data: placesWithPreferenceMatch,
      meta: {
        count: placesWithPreferenceMatch.length,
        matchingCount,
        totalFound: places.length,
        duration: `${duration}ms`,
        type: type || 'all',
        filters: userPreferences,
        time: checkTime || 'current',
      },
    });
  } catch (error) {
    console.error('❌ [API /places] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search places',
    });
  }
});

// GET /api/places/:placeId
router.get('/:placeId', async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;

    const place = await getPlaceDetails(placeId);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: 'Place not found',
      });
    }

    res.json({
      success: true,
      data: place,
    });
  } catch (error) {
    console.error('Get place details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get place details',
    });
  }
});

export default router;

