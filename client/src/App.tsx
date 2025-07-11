import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import SubscriptionsPage from "@/pages/subscriptions";
import WarrantiesPage from "@/pages/warranties";
import RemindersPage from "@/pages/reminders";
import Header from "@/components/layout/header";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/subscriptions" component={SubscriptionsPage} />
        <Route path="/warranties" component={WarrantiesPage} />
        <Route path="/reminders" component={RemindersPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
