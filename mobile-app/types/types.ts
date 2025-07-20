import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  Dashboard: undefined;
  Subscriptions: undefined;
  Warranties: undefined;
  EnhancedWarranties: undefined;
  Reminders: undefined;
  Profile: undefined;
  NotFound: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// User profile type for auth state and profile screens
export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileCompleted: boolean;
  dateOfBirth?: string;
}

export interface Subscription {
  id: number;
  userId: number;
  name: string;
  amount: string | number;
  billingCycle: string;
  category?: string | null;
  nextRenewalDate: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}
