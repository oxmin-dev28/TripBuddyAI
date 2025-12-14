import { GeneratePlanRequest, GeneratePlanResponse, ApiResponse, TripPlan, PlaceOption } from '../types';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ====================================
// 🔧 API URL Configuration
// ====================================
// 
// FOR PRODUCTION: Set this environment variable in your build config
// Example: EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
//
// FOR DEVELOPMENT: Auto-detected from Expo host IP
//
const getBaseUrl = () => {
  // 1. Check for production environment variable (highest priority)
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('🌐 [API] Using EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // 2. Development mode: Auto-detect from Expo manifest (works with Expo Go)
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    const hostIp = debuggerHost.split(':')[0];
    console.log('🌐 [API] Development: Using host IP:', hostIp);
    return `http://${hostIp}:3001/api`;
  }
  
  // 3. Fallback for Android emulator (special localhost IP)
  if (Platform.OS === 'android') {
    console.log('🌐 [API] Using Android emulator localhost');
    return 'http://10.0.2.2:3001/api';
  }
  
  // 4. Default localhost for iOS simulator
  console.log('🌐 [API] Using iOS simulator localhost');
  return 'http://localhost:3001/api';
};

export const API_BASE_URL = getBaseUrl();
console.log('🔗 [API] Base URL:', API_BASE_URL);

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Something went wrong',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// API Functions
export const api = {
  // Generate travel plan
  generatePlan: async (request: GeneratePlanRequest): Promise<ApiResponse<GeneratePlanResponse>> => {
    return apiCall<GeneratePlanResponse>('/generate-plan', 'POST', request);
  },

  // Vote for an option
  vote: async (groupId: string, optionId: string, userId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>('/vote', 'POST', { groupId, optionId, userId });
  },

  // Get nearby places with optional preferences filtering
  getNearbyPlaces: async (
    lat: number, 
    lng: number, 
    type?: string,
    preferences?: {
      cuisines?: string[];
      budget?: string;
      interests?: string[];
      radius?: number;
    }
  ): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    
    if (type) params.append('type', type);
    if (preferences?.cuisines?.length) params.append('cuisines', preferences.cuisines.join(','));
    if (preferences?.budget) params.append('budget', preferences.budget);
    if (preferences?.interests?.length) params.append('interests', preferences.interests.join(','));
    if (preferences?.radius) params.append('radius', preferences.radius.toString());
    
    console.log('🔍 [API] getNearbyPlaces:', { lat, lng, type, preferences });
    return apiCall<any[]>(`/places?${params}`);
  },

  // Get plan by ID
  getPlan: async (planId: string): Promise<ApiResponse<TripPlan>> => {
    return apiCall<TripPlan>(`/plans/${planId}`);
  },

  // Update plan
  updatePlan: async (planId: string, updates: Partial<TripPlan>): Promise<ApiResponse<TripPlan>> => {
    return apiCall<TripPlan>(`/plans/${planId}`, 'PUT', updates);
  },

  // Save user preferences
  savePreferences: async (userId: string, preferences: object): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/users/${userId}/preferences`, 'PUT', preferences);
  },

  // Get weather
  getWeather: async (lat: number, lng: number): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/weather?lat=${lat}&lng=${lng}`);
  },
};

// Export getNearbyPlaces as standalone function for convenience
export const getNearbyPlaces = async (
  lat: number,
  lng: number,
  type?: string,
  cuisines?: string,
  budget?: string,
  interests?: string,
  radius?: number
): Promise<PlaceOption[]> => {
  const preferences = {
    cuisines: cuisines ? cuisines.split(',').filter(Boolean) : undefined,
    budget,
    interests: interests ? interests.split(',').filter(Boolean) : undefined,
    radius,
  };
  
  const response = await api.getNearbyPlaces(lat, lng, type, preferences);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  console.error('Error getting nearby places:', response.error);
  return [];
};

