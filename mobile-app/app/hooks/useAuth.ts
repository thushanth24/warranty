// Shared Zustand Auth Store for Web and React Native
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Platform-aware storage
let storage: any;

if (typeof window !== 'undefined' && window.localStorage) {
  // Web
  storage = createJSONStorage(() => window.localStorage);
} else {
  // React Native
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = createJSONStorage(() => AsyncStorage);
}

// Define User type (move to shared if you have a schema)
export interface User {
  id: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileCompleted?: boolean;
  // Add any other fields as needed
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage,
    }
  )
);
