import { UserPreferences, Location, PlaceOption, DayPlan } from '../types';
interface GeneratePlanParams {
    preferences: UserPreferences;
    location: Location;
    nearbyPlaces: PlaceOption[];
    weather?: string;
}
export declare function generateTripPlan(params: GeneratePlanParams): Promise<DayPlan[]>;
export {};
//# sourceMappingURL=openai.d.ts.map