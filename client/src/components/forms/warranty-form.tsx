import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertWarrantySchema, type InsertWarranty, type Warranty } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

const warrantyFormSchema = insertWarrantySchema.extend({
  purchaseDate: z.string().min(1, "Purchase date is required"),
});

type WarrantyFormData = z.infer<typeof warrantyFormSchema>;

interface WarrantyFormProps {
  warranty?: Warranty;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WarrantyForm({ warranty, onSuccess, onCancel }: WarrantyFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<WarrantyFormData>({
    resolver: zodResolver(warrantyFormSchema),
    defaultValues: {
      productName: warranty?.productName || "",
      vendor: warranty?.vendor || "",
      purchaseDate: warranty?.purchaseDate 
        ? new Date(warranty.purchaseDate).toISOString().split('T')[0]
        : "",
      warrantyDuration: warranty?.warrantyDuration || 12,
      description: warranty?.description || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: WarrantyFormData) => {
      const purchaseDate = new Date(data.purchaseDate);
      const expirationDate = new Date(purchaseDate);
      expirationDate.setMonth(expirationDate.getMonth() + data.warrantyDuration);
      
      const payload = {
        ...data,
        purchaseDate,
        expirationDate,
      };
      return apiRequest("POST", `/api/warranties/${user?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Warranty created successfully" });
      onSuccess?.();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create warranty",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: WarrantyFormData) => {
      const purchaseDate = new Date(data.purchaseDate);
      const expirationDate = new Date(purchaseDate);
      expirationDate.setMonth(expirationDate.getMonth() + data.warrantyDuration);
      
      const payload = {
        ...data,
        purchaseDate,
        expirationDate,
      };
      return apiRequest("PUT", `/api/warranties/${user?.id}/${warranty?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Warranty updated successfully" });
      onSuccess?.();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update warranty",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: WarrantyFormData) => {
    if (warranty) {
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
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., MacBook Pro 16, iPhone 14 Pro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor/Manufacturer *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Apple, Samsung, Sony" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warrantyDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warranty Duration (Months) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="12" 
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any notes about this warranty..."
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
            {isLoading ? "Saving..." : warranty ? "Update Warranty" : "Add Warranty"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
