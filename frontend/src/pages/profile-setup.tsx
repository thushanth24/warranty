import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import ProfileForm from "@/components/forms/profile-form";
import { useLocation } from "wouter";

export default function ProfileSetupPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleProfileComplete = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <ProfileForm 
            user={user} 
            onSuccess={handleProfileComplete}
            isFirstTime={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}