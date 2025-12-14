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

// Place from Google Places
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
  location?: Location;
  openingHours?: OpeningHours;
}

// Time slot
export interface TimeSlot {
  time: string;
  type: string;
  title: string;
  options: PlaceOption[];
}

// Day plan
export interface DayPlan {
  dayNumber: number;
  date: string;
  slots: TimeSlot[];
}

// Trip plan
export interface TripPlan {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
}

// API Request types
export interface GeneratePlanRequest {
  userId: string;
  location: Location;
  preferences: UserPreferences;
}

export interface VoteRequest {
  groupId: string;
  userId: string;
  slotIndex: number;
  optionId: string;
}

// Database types
export interface DBUser {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  created_at: Date;
  updated_at: Date;
}

export interface DBVisit {
  id: string;
  user_id: string;
  place_id: string;
  rating: number;
  visited_at: Date;
}

export interface DBPlan {
  id: string;
  user_id: string;
  json_plan: TripPlan;
  created_at: Date;
  updated_at: Date;
}

