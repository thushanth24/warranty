import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertSubscriptionSchema, type InsertSubscription, type Subscription } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

const subscriptionFormSchema = insertSubscriptionSchema.extend({
  nextRenewalDate: z.string().min(1, "Next renewal date is required"),
});

type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

interface SubscriptionFormProps {
  subscription?: Subscription;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SubscriptionForm({ subscription, onSuccess, onCancel }: SubscriptionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: subscription?.name || "",
      amount: subscription?.amount || "",
      billingCycle: subscription?.billingCycle || "",
      category: subscription?.category || "",
      nextRenewalDate: subscription?.nextRenewalDate 
        ? new Date(subscription.nextRenewalDate).toISOString().split('T')[0]
        : "",
      description: subscription?.description || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      const payload = {
        ...data,
        amount: String(data.amount), // Ensure amount is a string
        nextRenewalDate: new Date(data.nextRenewalDate), // Ensure this is a Date object
      };
      return apiRequest("POST", `/api/subscriptions/${user.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Subscription created successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      // Try to extract backend error message and details
      let description = "Failed to create subscription";
      if (error instanceof Response) {
        error.json().then((data: any) => {
          console.error("Backend error:", data);
          if (data?.message) description = data.message;
          if (data?.errors) description += ": " + JSON.stringify(data.errors);
          toast({ 
            title: "Error", 
            description,
            variant: "destructive" 
          });
        });
      } else {
        console.error("Mutation error:", error);
        toast({ 
          title: "Error", 
          description,
          variant: "destructive" 
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData) => {
      if (!user?.id || !subscription?.id) {
        throw new Error("User not authenticated or subscription not found");
      }
      const payload = {
        ...data,
        amount: String(data.amount), // Ensure amount is a string
        nextRenewalDate: new Date(data.nextRenewalDate), // Ensure this is a Date object
      };
      return apiRequest("PUT", `/api/subscriptions/${user.id}/${subscription.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Subscription updated successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      // Try to extract backend error message and details
      let description = "Failed to update subscription";
      if (error instanceof Response) {
        error.json().then((data: any) => {
          console.error("Backend error:", data);
          if (data?.message) description = data.message;
          if (data?.errors) description += ": " + JSON.stringify(data.errors);
          toast({ 
            title: "Error", 
            description,
            variant: "destructive" 
          });
        });
      } else {
        console.error("Mutation error:", error);
        toast({ 
          title: "Error", 
          description,
          variant: "destructive" 
        });
      }
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    if (!user?.id) {
      toast({ 
        title: "Error", 
        description: "Please sign in to continue",
        variant: "destructive" 
      });
      return;
    }
    
    if (subscription) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Netflix, Spotify" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="9.99" 
                      className="pl-8"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="billingCycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Cycle *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="cloud-storage">Cloud Storage</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextRenewalDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Renewal Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any notes about this subscription..."
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : subscription ? "Update Subscription" : "Add Subscription"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
