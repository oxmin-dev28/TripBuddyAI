import { Location, PlaceOption } from '../types';
interface NearbySearchParams {
    location: Location;
    type?: string;
    radius?: number;
    keyword?: string;
}
export declare function searchNearbyPlaces(params: NearbySearchParams): Promise<PlaceOption[]>;
export declare function getPlaceDetails(placeId: string): Promise<PlaceOption | null>;
export declare function testGooglePlacesApi(): Promise<{
    working: boolean;
    message: string;
}>;
export {};
//# sourceMappingURL=googlePlaces.d.ts.map