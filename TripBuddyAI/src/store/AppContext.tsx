import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, TripPlan, Location } from '../types';

// State type
interface AppState {
  isOnboarded: boolean;
  preferences: UserPreferences;
  currentLocation: Location | null;
  activePlan: TripPlan | null;
  tripHistory: TripPlan[];
  isLoading: boolean;
}

// Initial state
const initialState: AppState = {
  isOnboarded: false,
  preferences: {
    countries: [],
    cuisines: [],
    activityType: 'mixed',
    days: 3,
    budget: 'medium',
    interests: [],
  },
  currentLocation: null,
  activePlan: null,
  tripHistory: [],
  isLoading: true,
};

// Actions
type AppAction =
  | { type: 'SET_ONBOARDED'; payload: boolean }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'SET_ACTIVE_PLAN'; payload: TripPlan | null }
  | { type: 'ADD_TO_HISTORY'; payload: TripPlan }
  | { type: 'UPDATE_TRIP'; payload: TripPlan }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'REORDER_TRIPS'; payload: TripPlan[] }
  | { type: 'DUPLICATE_TRIP'; payload: TripPlan }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'RESET' };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ONBOARDED':
      return { ...state, isOnboarded: action.payload };
    case 'UPDATE_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'SET_LOCATION':
      return { ...state, currentLocation: action.payload };
    case 'SET_ACTIVE_PLAN':
      return { ...state, activePlan: action.payload };
    case 'ADD_TO_HISTORY':
      return { ...state, tripHistory: [action.payload, ...state.tripHistory] };
    case 'UPDATE_TRIP':
      return {
        ...state,
        tripHistory: state.tripHistory.map(trip =>
          trip.id === action.payload.id ? action.payload : trip
        ),
        activePlan: state.activePlan?.id === action.payload.id ? action.payload : state.activePlan,
      };
    case 'DELETE_TRIP':
      return {
        ...state,
        tripHistory: state.tripHistory.filter(trip => trip.id !== action.payload),
        activePlan: state.activePlan?.id === action.payload ? null : state.activePlan,
      };
    case 'REORDER_TRIPS':
      return { ...state, tripHistory: action.payload };
    case 'DUPLICATE_TRIP':
      return { ...state, tripHistory: [action.payload, ...state.tripHistory] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload, isLoading: false };
    case 'RESET':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setOnboarded: (value: boolean) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setLocation: (location: Location) => void;
  setActivePlan: (plan: TripPlan | null) => void;
  addToHistory: (plan: TripPlan) => void;
  updateTrip: (plan: TripPlan) => void;
  deleteTrip: (planId: string) => void;
  duplicateTrip: (plan: TripPlan) => void;
  reorderTrips: (trips: TripPlan[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = '@tripbuddy_state';

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from storage on mount
  useEffect(() => {
    loadState();
  }, []);

  // Save state to storage when it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveState();
    }
  }, [state]);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error loading state:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveState = async () => {
    try {
      const { isLoading, ...stateToSave } = state;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  // Helper functions
  const setOnboarded = (value: boolean) => {
    dispatch({ type: 'SET_ONBOARDED', payload: value });
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: prefs });
  };

  const setLocation = (location: Location) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
  };

  const setActivePlan = (plan: TripPlan | null) => {
    dispatch({ type: 'SET_ACTIVE_PLAN', payload: plan });
  };

  const addToHistory = (plan: TripPlan) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: plan });
  };

  const updateTrip = (plan: TripPlan) => {
    dispatch({ type: 'UPDATE_TRIP', payload: plan });
  };

  const deleteTrip = (planId: string) => {
    dispatch({ type: 'DELETE_TRIP', payload: planId });
  };

  const duplicateTrip = (plan: TripPlan) => {
    const newPlan: TripPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      title: `${plan.title} (копия)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'DUPLICATE_TRIP', payload: newPlan });
  };

  const reorderTrips = (trips: TripPlan[]) => {
    dispatch({ type: 'REORDER_TRIPS', payload: trips });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setOnboarded,
        updatePreferences,
        setLocation,
        setActivePlan,
        addToHistory,
        updateTrip,
        deleteTrip,
        duplicateTrip,
        reorderTrips,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook to use context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

