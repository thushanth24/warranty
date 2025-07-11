import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { useAuth } from "./lib/auth";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import SubscriptionsPage from "@/pages/subscriptions";
import WarrantiesPage from "@/pages/warranties";
import EnhancedWarrantiesPage from "@/pages/enhanced-warranties";
import RemindersPage from "@/pages/reminders";
import ProfilePage from "@/pages/profile";
import ProfileSetupPage from "@/pages/profile-setup";
import MainLayout from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const { user } = useAuth();
  
  // If user hasn't completed profile, show profile setup
  if (user && !user.profileCompleted) {
    return <ProfileSetupPage />;
  }
  
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/subscriptions" component={SubscriptionsPage} />
        <Route path="/warranties" component={WarrantiesPage} />
        <Route path="/enhanced-warranties" component={EnhancedWarrantiesPage} />
        <Route path="/reminders" component={RemindersPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AuthPage />;
  }
  
  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
