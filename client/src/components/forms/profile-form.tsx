import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileSchema, type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user?: User;
  onSuccess?: (user: User) => void;
  onCancel?: () => void;
  isFirstTime?: boolean;
}

export default function ProfileForm({ user, onSuccess, onCancel, isFirstTime = false }: ProfileFormProps) {
  const { user: currentUser, login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      dateOfBirth: user?.dateOfBirth 
        ? new Date(user.dateOfBirth).toISOString().split('T')[0]
        : "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      const payload = {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        profileCompleted: true,
      };
      return apiRequest("PUT", `/api/users/${currentUser.id}/profile`, payload);
    },
    onSuccess: (updatedUser) => {
      // Update auth state with new user data
      login(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUser?.id] });
      toast({ 
        title: "Success", 
        description: isFirstTime ? "Profile created successfully!" : "Profile updated successfully!" 
      });
      onSuccess?.(updatedUser);
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update profile",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    if (!currentUser?.id) {
      toast({ 
        title: "Error", 
        description: "Please sign in to continue",
        variant: "destructive" 
      });
      return;
    }
    
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {isFirstTime && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please provide your details to get started with SubTracker.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending 
                ? "Saving..." 
                : isFirstTime 
                  ? "Complete Profile" 
                  : "Update Profile"
              }
            </Button>
            {!isFirstTime && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}