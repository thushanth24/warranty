import "../nativewind/tailwind.css";
import { AppProviders } from "../components/providers";
export default function App({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}

