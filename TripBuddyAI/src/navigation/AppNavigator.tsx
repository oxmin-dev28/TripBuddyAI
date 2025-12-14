import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/theme';
import { RootStackParamList } from '../types';
import { RebootFlowScreen } from '../screens/main';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}
        initialRouteName="RebootFlow"
      >
        <Stack.Screen name="RebootFlow" component={RebootFlowScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
