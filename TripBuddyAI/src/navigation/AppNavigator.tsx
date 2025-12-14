import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../store/AppContext';
import { Colors } from '../constants/theme';
import { RootStackParamList } from '../types';

// Auth Screens
// import { AuthScreen } from '../screens/auth';

// Onboarding Screens
import {
  OnboardingCountry,
  OnboardingCuisine,
  OnboardingActivity,
  OnboardingDays,
  OnboardingInterests,
} from '../screens/onboarding';

// Main Screens
import {
  HomeScreen,
  SelectCountryScreen,
  SelectCityScreen,
  PlaceSelectionScreen,
  GeneratePlanScreen,
  DayViewScreen,
  MapScreen,
  ProfileScreen,
  // LeaderboardScreen,
  EditPreferencesScreen,
  TripHistoryScreen,
  PlanDetailsScreen,
  RebootFlowScreen,
} from '../screens/main';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { state } = useApp();

  // Show loading screen while checking onboarding status
  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}
        initialRouteName={state.isOnboarded ? 'Main' : 'OnboardingCountry'}
      >
        {/* Auth Flow (optional - can skip as guest) */}
        {/* <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ headerShown: false }}
        /> */}

        {/* Onboarding Flow */}
        <Stack.Screen name="OnboardingCountry" component={OnboardingCountry} />
        <Stack.Screen name="OnboardingCuisine" component={OnboardingCuisine} />
        <Stack.Screen name="OnboardingActivity" component={OnboardingActivity} />
        <Stack.Screen name="OnboardingDays" component={OnboardingDays} />
        <Stack.Screen name="OnboardingInterests" component={OnboardingInterests} />

        {/* Main App Flow */}
        <Stack.Screen name="Main" component={HomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="SelectCountry" 
          component={SelectCountryScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="SelectCity" 
          component={SelectCityScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="PlaceSelection" 
          component={PlaceSelectionScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="GeneratePlan" 
          component={GeneratePlanScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="DayView" component={DayViewScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        {/* <Stack.Screen name="Leaderboard" component={LeaderboardScreen} /> */}
        <Stack.Screen name="EditPreferences" component={EditPreferencesScreen} />
        <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
        <Stack.Screen name="PlanDetails" component={PlanDetailsScreen} />
        <Stack.Screen name="RebootFlow" component={RebootFlowScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

