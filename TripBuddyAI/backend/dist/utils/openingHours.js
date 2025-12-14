"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENING_HOURS_TEMPLATES = void 0;
exports.isPlaceOpenAt = isPlaceOpenAt;
exports.filterOpenPlaces = filterOpenPlaces;
exports.updateOpenStatus = updateOpenStatus;
exports.sortPlacesByRelevance = sortPlacesByRelevance;
// Days of week mapping
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
/**
 * Check if a place is open at a specific time
 * @param place - The place to check
 * @param time - Time in HH:MM format (e.g., "14:00")
 * @param date - Optional date (defaults to today)
 * @returns true if open, false if closed, undefined if unknown
 */
function isPlaceOpenAt(place, time, date = new Date()) {
    if (!place.openingHours) {
        // If no opening hours data, assume open (be optimistic)
        return undefined;
    }
    const dayName = DAYS[date.getDay()];
    const hours = place.openingHours[dayName];
    if (!hours) {
        // Place is closed on this day
        return false;
    }
    const [checkHour, checkMinute] = time.split(':').map(Number);
    const [openHour, openMinute] = hours.open.split(':').map(Number);
    const [closeHour, closeMinute] = hours.close.split(':').map(Number);
    const checkTime = checkHour * 60 + checkMinute;
    const openTime = openHour * 60 + openMinute;
    let closeTime = closeHour * 60 + closeMinute;
    // Handle places that close after midnight (e.g., nightclubs)
    if (closeTime < openTime) {
        // If checking time is before midnight
        if (checkTime >= openTime) {
            return true;
        }
        // If checking time is after midnight
        if (checkTime < closeTime) {
            return true;
        }
        return false;
    }
    return checkTime >= openTime && checkTime < closeTime;
}
/**
 * Filter places that are open at a specific time
 */
function filterOpenPlaces(places, time, date = new Date()) {
    return places.filter(place => {
        const isOpen = isPlaceOpenAt(place, time, date);
        // Include if open or unknown (no hours data)
        return isOpen !== false;
    });
}
/**
 * Update isOpen field for all places based on current time
 */
function updateOpenStatus(places, time, date = new Date()) {
    const checkTime = time || `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return places.map(place => {
        const isOpen = isPlaceOpenAt(place, checkTime, date);
        return {
            ...place,
            isOpen: isOpen ?? place.isOpen,
        };
    });
}
/**
 * Get places sorted by relevance for a time slot
 * Open places first, then by rating
 */
function sortPlacesByRelevance(places, time, date = new Date()) {
    const placesWithStatus = updateOpenStatus(places, time, date);
    return placesWithStatus.sort((a, b) => {
        // Open places first
        if (a.isOpen && !b.isOpen)
            return -1;
        if (!a.isOpen && b.isOpen)
            return 1;
        // Then by rating
        return (b.rating || 0) - (a.rating || 0);
    });
}
/**
 * Standard opening hours templates
 */
exports.OPENING_HOURS_TEMPLATES = {
    // Restaurants typically open for lunch and dinner
    restaurant: {
        monday: { open: '12:00', close: '23:00' },
        tuesday: { open: '12:00', close: '23:00' },
        wednesday: { open: '12:00', close: '23:00' },
        thursday: { open: '12:00', close: '23:00' },
        friday: { open: '12:00', close: '00:00' },
        saturday: { open: '12:00', close: '00:00' },
        sunday: { open: '12:00', close: '22:00' },
    },
    // Cafes open early
    cafe: {
        monday: { open: '07:00', close: '20:00' },
        tuesday: { open: '07:00', close: '20:00' },
        wednesday: { open: '07:00', close: '20:00' },
        thursday: { open: '07:00', close: '20:00' },
        friday: { open: '07:00', close: '21:00' },
        saturday: { open: '08:00', close: '21:00' },
        sunday: { open: '08:00', close: '19:00' },
    },
    // Museums typical hours
    museum: {
        monday: undefined, // Many museums closed on Monday
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '21:00' }, // Late night Thursday
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '09:00', close: '18:00' },
    },
    // Attractions/landmarks
    attraction: {
        monday: { open: '09:00', close: '23:00' },
        tuesday: { open: '09:00', close: '23:00' },
        wednesday: { open: '09:00', close: '23:00' },
        thursday: { open: '09:00', close: '23:00' },
        friday: { open: '09:00', close: '00:00' },
        saturday: { open: '09:00', close: '00:00' },
        sunday: { open: '09:00', close: '23:00' },
    },
    // Parks (dawn to dusk)
    park: {
        monday: { open: '06:00', close: '22:00' },
        tuesday: { open: '06:00', close: '22:00' },
        wednesday: { open: '06:00', close: '22:00' },
        thursday: { open: '06:00', close: '22:00' },
        friday: { open: '06:00', close: '22:00' },
        saturday: { open: '06:00', close: '22:00' },
        sunday: { open: '06:00', close: '22:00' },
    },
    // Shopping
    shopping: {
        monday: { open: '10:00', close: '20:00' },
        tuesday: { open: '10:00', close: '20:00' },
        wednesday: { open: '10:00', close: '20:00' },
        thursday: { open: '10:00', close: '21:00' },
        friday: { open: '10:00', close: '21:00' },
        saturday: { open: '10:00', close: '20:00' },
        sunday: { open: '11:00', close: '19:00' },
    },
    // Nightlife
    nightlife: {
        monday: undefined,
        tuesday: undefined,
        wednesday: { open: '22:00', close: '05:00' },
        thursday: { open: '22:00', close: '05:00' },
        friday: { open: '22:00', close: '06:00' },
        saturday: { open: '22:00', close: '06:00' },
        sunday: { open: '22:00', close: '04:00' },
    },
};
//# sourceMappingURL=openingHours.js.map