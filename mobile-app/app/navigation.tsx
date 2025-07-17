import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "./screens/DashboardScreen";
import SubscriptionsScreen from "./screens/SubscriptionsScreen";
import WarrantiesScreen from "./screens/WarrantiesScreen";
import EnhancedWarrantiesScreen from "./screens/EnhancedWarrantiesScreen";
import RemindersScreen from "./screens/RemindersScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ProfileSetupScreen from "./screens/ProfileSetupScreen";
import AuthScreen from "./screens/AuthScreen";
import NotFoundScreen from "./screens/NotFoundScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
        <Stack.Screen name="Warranties" component={WarrantiesScreen} />
        <Stack.Screen name="EnhancedWarranties" component={EnhancedWarrantiesScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
