import "../nativewind/tailwind.css";
import { AppProviders } from "../components/providers";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>{children}</AppProviders>
    </GestureHandlerRootView>
  );
}

