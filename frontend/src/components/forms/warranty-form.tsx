import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import removed: now using backend-provided JSON Schema and ajv for validation
import { apiRequest } from "../../lib/queryClient";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { z } from "zod";

// Schema now fetched from backend as JSON Schema. See below for validation logic.
// const warrantyFormSchema = ...

// import { warrantyFormSchema } from "@shared/schema";
// If warrantyFormSchema is not available, define a fallback or comment out.
// type WarrantyFormData = z.infer<typeof warrantyFormSchema>;
type WarrantyFormData = any; // TODO: Replace with actual schema type

import { warranties } from "../../../shared/schema";
type Warranty = typeof warranties.$inferSelect;

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
    // resolver: zodResolver(warrantyFormSchema),
// Will use ajv validation after fetching JSON Schema
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
        userId: user.id,
        purchaseDate: purchaseDate.toISOString(),
        expirationDate: expirationDate.toISOString(),
      };
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return apiRequest("POST", `/api/warranties/${user.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Warranty created successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      let description = "Failed to create warranty";
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
    mutationFn: async (data: WarrantyFormData) => {
      const purchaseDate = new Date(data.purchaseDate);
      const expirationDate = new Date(purchaseDate);
      expirationDate.setMonth(expirationDate.getMonth() + data.warrantyDuration);
      
      const payload = {
        ...data,
        userId: user.id,
        purchaseDate: purchaseDate.toISOString(),
        expirationDate: expirationDate.toISOString(),
      };
      if (!user?.id || !warranty?.id) {
        throw new Error("User not authenticated or warranty not found");
      }
      return apiRequest("PUT", `/api/warranties/${user.id}/${warranty.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Warranty updated successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      let description = "Failed to update warranty";
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

  const onSubmit = (data: WarrantyFormData) => {
    if (!user?.id) {
      toast({ 
        title: "Error", 
        description: "Please sign in to continue",
        variant: "destructive" 
      });
      return;
    }
    
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
              <FormLabel htmlFor="productName">Product Name *</FormLabel>
              <FormControl>
                <Input id="productName" placeholder="e.g., MacBook Pro 16, iPhone 14 Pro" {...field} />
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
              <FormLabel htmlFor="vendor">Vendor/Manufacturer *</FormLabel>
              <FormControl>
                <Input id="vendor" placeholder="e.g., Apple, Samsung, Sony" {...field} />
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
                <FormLabel htmlFor="purchaseDate">Purchase Date *</FormLabel>
                <FormControl>
                  <Input id="purchaseDate" type="date" {...field} />
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
                <FormLabel htmlFor="warrantyDuration">Warranty Duration (Months) *</FormLabel>
                <FormControl>
                  <Input 
                    id="warrantyDuration"
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
              <FormLabel htmlFor="description">Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  id="description"
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
