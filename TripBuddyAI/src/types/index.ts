// User preferences type
export interface UserPreferences {
  countries: string[];
  cuisines: string[];
  activityType: 'active' | 'passive' | 'mixed';
  days: number;
  budget: 'low' | 'medium' | 'high';
  interests: string[];
}

// Location type
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  country?: string;
}

// Opening hours for a place
export interface OpeningHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

// Place option from Google Places
export interface PlaceOption {
  id: string;
  googlePlaceId: string;
  name: string;
  type: string;
  rating: number;
  priceLevel: string;
  distance: string;
  duration: string;
  address: string;
  photoUrl?: string;
  isOpen?: boolean;
  discount?: string;
  votes?: number;
  userVoted?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  openingHours?: OpeningHours;
  matchesPreferences?: boolean; // True if place matches user's preferences
}

// Time slot in a day plan
export interface TimeSlot {
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'museum' | 'attraction' | 'walk' | 'activity' | 'nightlife' | 'shopping';
  title: string;
  options: PlaceOption[];
  selectedOption?: string;
}

// Day plan
export interface DayPlan {
  dayNumber: number;
  date: string;
  slots: TimeSlot[];
}

// Destination city info
export interface DestinationCity {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

// Full trip plan
export interface TripPlan {
  id: string;
  userId: string;
  title: string;
  destination: string;
  destinationCity: DestinationCity;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
}

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
}

// Group for voting
export interface TripGroup {
  id: string;
  name: string;
  code: string;
  members: User[];
  tripPlan?: TripPlan;
  createdAt: string;
}

// Vote
export interface Vote {
  id: string;
  groupId: string;
  userId: string;
  slotIndex: number;
  optionId: string;
  createdAt: string;
}

// Navigation types
export type { CityData } from '../constants/cities';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  OnboardingCountry: undefined;
  OnboardingCuisine: undefined;
  OnboardingActivity: undefined;
  OnboardingDays: undefined;
  OnboardingInterests: undefined;
  Main: undefined;
  Home: undefined;
  SelectCountry: undefined;
  SelectCity: { countryId: string };
  PlaceSelection: { selectedCity: CityData; numDays: number };
  GeneratePlan: { selectedCity?: CityData; selectedPlaces?: PlaceOption[] } | undefined;
  DayView: { dayIndex: number; plan: TripPlan };
  Map: { 
    places?: PlaceOption[];
    // If destination is provided, show places for that city instead of current location
    destination?: DestinationCity;
    mode?: 'explore' | 'route'; // 'explore' = current location, 'route' = destination city
  };
  Profile: undefined;
  Leaderboard: undefined;
  EditPreferences: undefined;
  TripHistory: undefined;
  PlanDetails: { planId: string };
  RebootFlow: undefined;
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GeneratePlanRequest {
  userId: string;
  location: Location;
  preferences: UserPreferences;
}

export interface GeneratePlanResponse {
  plan: TripPlan;
}

