"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googlePlaces_1 = require("../services/googlePlaces");
const openingHours_1 = require("../utils/openingHours");
const router = (0, express_1.Router)();
// GET /api/places
// Accepts: lat, lng, type, radius, keyword, cuisines, budget, interests, time, openOnly
router.get('/', async (req, res) => {
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
            cuisines: cuisines ? cuisines.split(',') : [],
            budget: budget || 'medium',
            interests: interests ? interests.split(',') : [],
        };
        // Build keyword from preferences for better search
        let searchKeyword = keyword || '';
        if (userPreferences.cuisines.length > 0 && (type === 'restaurant' || type === 'all')) {
            searchKeyword = userPreferences.cuisines.slice(0, 2).join(' ') + ' ' + searchKeyword;
        }
        let places = await (0, googlePlaces_1.searchNearbyPlaces)({
            location: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            },
            type: type || 'all',
            radius: radius ? parseInt(radius) : 5000,
            keyword: searchKeyword.trim() || undefined,
        });
        // Update open status based on time parameter or current time
        const checkTime = time || undefined;
        places = (0, openingHours_1.updateOpenStatus)(places, checkTime);
        // Filter only open places if requested
        if (openOnly === 'true' && checkTime) {
            places = (0, openingHours_1.filterOpenPlaces)(places, checkTime);
            console.log(`   Filtered to ${places.length} open places at ${checkTime}`);
        }
        // Sort by relevance (open places first, then by rating)
        if (checkTime) {
            places = (0, openingHours_1.sortPlacesByRelevance)(places, checkTime);
        }
        // Filter places by budget if specified
        let filteredPlaces = places;
        if (userPreferences.budget) {
            filteredPlaces = places.filter(place => {
                const priceLevel = place.priceLevel;
                if (userPreferences.budget === 'low') {
                    return priceLevel === '$' || priceLevel === '$$';
                }
                else if (userPreferences.budget === 'high') {
                    return priceLevel === '$$$' || priceLevel === '$$$$';
                }
                return true; // medium accepts all
            });
        }
        const duration = Date.now() - startTime;
        console.log(`✅ [API /places] Returning ${filteredPlaces.length} places in ${duration}ms`);
        console.log(`   Filtered from ${places.length} by budget: ${userPreferences.budget}`);
        res.json({
            success: true,
            data: filteredPlaces,
            meta: {
                count: filteredPlaces.length,
                totalFound: places.length,
                duration: `${duration}ms`,
                type: type || 'all',
                filters: userPreferences,
                time: checkTime || 'current',
            },
        });
    }
    catch (error) {
        console.error('❌ [API /places] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search places',
        });
    }
});
// GET /api/places/:placeId
router.get('/:placeId', async (req, res) => {
    try {
        const { placeId } = req.params;
        const place = await (0, googlePlaces_1.getPlaceDetails)(placeId);
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
    }
    catch (error) {
        console.error('Get place details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get place details',
        });
    }
});
exports.default = router;
//# sourceMappingURL=places.js.map