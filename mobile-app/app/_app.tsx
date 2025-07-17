import "nativewind/tailwind.css";
import { AppProviders } from "./providers";
import AppNavigation from "./navigation";

export default function App() {
  return (
    <AppProviders>
      <AppNavigation />
    </AppProviders>
  );
}
