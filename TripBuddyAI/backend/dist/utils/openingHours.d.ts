import { PlaceOption } from '../types';
/**
 * Check if a place is open at a specific time
 * @param place - The place to check
 * @param time - Time in HH:MM format (e.g., "14:00")
 * @param date - Optional date (defaults to today)
 * @returns true if open, false if closed, undefined if unknown
 */
export declare function isPlaceOpenAt(place: PlaceOption, time: string, date?: Date): boolean | undefined;
/**
 * Filter places that are open at a specific time
 */
export declare function filterOpenPlaces(places: PlaceOption[], time: string, date?: Date): PlaceOption[];
/**
 * Update isOpen field for all places based on current time
 */
export declare function updateOpenStatus(places: PlaceOption[], time?: string, date?: Date): PlaceOption[];
/**
 * Get places sorted by relevance for a time slot
 * Open places first, then by rating
 */
export declare function sortPlacesByRelevance(places: PlaceOption[], time: string, date?: Date): PlaceOption[];
/**
 * Standard opening hours templates
 */
export declare const OPENING_HOURS_TEMPLATES: {
    readonly restaurant: {
        readonly monday: {
            readonly open: "12:00";
            readonly close: "23:00";
        };
        readonly tuesday: {
            readonly open: "12:00";
            readonly close: "23:00";
        };
        readonly wednesday: {
            readonly open: "12:00";
            readonly close: "23:00";
        };
        readonly thursday: {
            readonly open: "12:00";
            readonly close: "23:00";
        };
        readonly friday: {
            readonly open: "12:00";
            readonly close: "00:00";
        };
        readonly saturday: {
            readonly open: "12:00";
            readonly close: "00:00";
        };
        readonly sunday: {
            readonly open: "12:00";
            readonly close: "22:00";
        };
    };
    readonly cafe: {
        readonly monday: {
            readonly open: "07:00";
            readonly close: "20:00";
        };
        readonly tuesday: {
            readonly open: "07:00";
            readonly close: "20:00";
        };
        readonly wednesday: {
            readonly open: "07:00";
            readonly close: "20:00";
        };
        readonly thursday: {
            readonly open: "07:00";
            readonly close: "20:00";
        };
        readonly friday: {
            readonly open: "07:00";
            readonly close: "21:00";
        };
        readonly saturday: {
            readonly open: "08:00";
            readonly close: "21:00";
        };
        readonly sunday: {
            readonly open: "08:00";
            readonly close: "19:00";
        };
    };
    readonly museum: {
        readonly monday: undefined;
        readonly tuesday: {
            readonly open: "09:00";
            readonly close: "18:00";
        };
        readonly wednesday: {
            readonly open: "09:00";
            readonly close: "18:00";
        };
        readonly thursday: {
            readonly open: "09:00";
            readonly close: "21:00";
        };
        readonly friday: {
            readonly open: "09:00";
            readonly close: "18:00";
        };
        readonly saturday: {
            readonly open: "09:00";
            readonly close: "18:00";
        };
        readonly sunday: {
            readonly open: "09:00";
            readonly close: "18:00";
        };
    };
    readonly attraction: {
        readonly monday: {
            readonly open: "09:00";
            readonly close: "23:00";
        };
        readonly tuesday: {
            readonly open: "09:00";
            readonly close: "23:00";
        };
        readonly wednesday: {
            readonly open: "09:00";
            readonly close: "23:00";
        };
        readonly thursday: {
            readonly open: "09:00";
            readonly close: "23:00";
        };
        readonly friday: {
            readonly open: "09:00";
            readonly close: "00:00";
        };
        readonly saturday: {
            readonly open: "09:00";
            readonly close: "00:00";
        };
        readonly sunday: {
            readonly open: "09:00";
            readonly close: "23:00";
        };
    };
    readonly park: {
        readonly monday: {
            readonly open: "06:00";
            readonly close: "22:00";
        };
        readonly tuesday: {
            readonly open: "06:00";
            readonly close: "22:00";
        };
        readonly wednesday: {
            readonly open: "06:00";
            readonly close: "22:00";
        };
        readonly thursday: {
            readonly open: "06:00";
            readonly close: "22:00";
        };
        readonly friday: {
            readonly open: "06:00";
            readonly close: "22:00";
        };
        readonly saturday: {
            readonly open: "06:00";
            readonly close: "22:00";
        };
        readonly sunday: {
            readonly open: "06:00";
            readonly close: "22:00";
        };
    };
    readonly shopping: {
        readonly monday: {
            readonly open: "10:00";
            readonly close: "20:00";
        };
        readonly tuesday: {
            readonly open: "10:00";
            readonly close: "20:00";
        };
        readonly wednesday: {
            readonly open: "10:00";
            readonly close: "20:00";
        };
        readonly thursday: {
            readonly open: "10:00";
            readonly close: "21:00";
        };
        readonly friday: {
            readonly open: "10:00";
            readonly close: "21:00";
        };
        readonly saturday: {
            readonly open: "10:00";
            readonly close: "20:00";
        };
        readonly sunday: {
            readonly open: "11:00";
            readonly close: "19:00";
        };
    };
    readonly nightlife: {
        readonly monday: undefined;
        readonly tuesday: undefined;
        readonly wednesday: {
            readonly open: "22:00";
            readonly close: "05:00";
        };
        readonly thursday: {
            readonly open: "22:00";
            readonly close: "05:00";
        };
        readonly friday: {
            readonly open: "22:00";
            readonly close: "06:00";
        };
        readonly saturday: {
            readonly open: "22:00";
            readonly close: "06:00";
        };
        readonly sunday: {
            readonly open: "22:00";
            readonly close: "04:00";
        };
    };
};
//# sourceMappingURL=openingHours.d.ts.map