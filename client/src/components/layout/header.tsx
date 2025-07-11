import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, User, LogOut, Calendar } from "lucide-react";

export default function Header() {
  const { logout } = useAuth();
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", key: "dashboard" },
    { path: "/subscriptions", label: "Subscriptions", key: "subscriptions" },
    { path: "/warranties", label: "Warranties", key: "warranties" },
    { path: "/reminders", label: "Reminders", key: "reminders" },
  ];

  const mobileNavItems = [
    { path: "/", label: "Dashboard", key: "dashboard" },
    { path: "/subscriptions", label: "Subs", key: "subscriptions" },
    { path: "/warranties", label: "Warranty", key: "warranties" },
    { path: "/reminders", label: "Alerts", key: "reminders" },
  ];

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SubTracker Pro</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setLocation(item.path)}
                className={`pb-4 transition-colors ${
                  isActive(item.path)
                    ? "text-primary font-medium border-b-2 border-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-danger rounded-full flex items-center justify-center text-white text-xs">
                3
              </span>
            </Button>
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
          <div className="flex space-x-1">
            {mobileNavItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setLocation(item.path)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-primary bg-blue-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
