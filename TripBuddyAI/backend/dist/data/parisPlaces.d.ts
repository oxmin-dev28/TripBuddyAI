import { PlaceOption } from '../types';
export declare const PARIS_PLACES: PlaceOption[];
export declare function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
export declare function formatDistance(meters: number): string;
export declare function formatDuration(meters: number): string;
export declare function getParisPlacesWithDistance(userLat: number, userLng: number, type?: string): PlaceOption[];
//# sourceMappingURL=parisPlaces.d.ts.map