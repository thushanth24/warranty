import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Warranty } from "@shared/schema";
import { formatDate, getDaysUntil, getUrgencyColor, getUrgencyStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Laptop, Smartphone, Car, Home, Gamepad2, Watch } from "lucide-react";

interface WarrantyCardProps {
  warranty: Warranty;
  onEdit?: (warranty: Warranty) => void;
}

const getProductIcon = (productName: string) => {
  const lowerName = productName.toLowerCase();
  if (lowerName.includes('laptop') || lowerName.includes('macbook') || lowerName.includes('computer')) {
    return <Laptop className="text-gray-800" />;
  }
  if (lowerName.includes('phone') || lowerName.includes('iphone') || lowerName.includes('samsung')) {
    return <Smartphone className="text-blue-600" />;
  }
  if (lowerName.includes('car') || lowerName.includes('vehicle') || lowerName.includes('honda') || lowerName.includes('toyota')) {
    return <Car className="text-red-600" />;
  }
  if (lowerName.includes('home') || lowerName.includes('house') || lowerName.includes('appliance')) {
    return <Home className="text-green-600" />;
  }
  if (lowerName.includes('gaming') || lowerName.includes('console') || lowerName.includes('xbox') || lowerName.includes('playstation')) {
    return <Gamepad2 className="text-purple-600" />;
  }
  if (lowerName.includes('watch') || lowerName.includes('fitbit')) {
    return <Watch className="text-orange-600" />;
  }
  return <Laptop className="text-gray-600 dark:text-gray-300" />;
};

export default function WarrantyCard({ warranty, onEdit }: WarrantyCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const daysUntil = getDaysUntil(warranty.expirationDate);
  const urgencyColor = getUrgencyColor(daysUntil);
  const status = getUrgencyStatus(daysUntil);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/warranties/${user?.id}/${warranty.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Warranty deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete warranty",
        variant: "destructive" 
      });
    },
  });

  const extendMutation = useMutation({
    mutationFn: () => {
      const extendedDate = new Date(warranty.expirationDate);
      extendedDate.setMonth(extendedDate.getMonth() + warranty.warrantyDuration);
      return apiRequest("PUT", `/api/warranties/${user?.id}/${warranty.id}`, {
        expirationDate: extendedDate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Warranty extended successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to extend warranty",
        variant: "destructive" 
      });
    },
  });

  return (
    <Card className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-0 dark:shadow-lg">
      <CardContent className="p-6 text-gray-900 dark:text-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl">
              {getProductIcon(warranty.productName)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{warranty.productName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{warranty.vendor}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit?.(warranty)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Purchase Date</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatDate(warranty.purchaseDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Warranty Period</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {warranty.warrantyDuration} {warranty.warrantyDuration === 1 ? 'Month' : 'Months'}
            </span>
          </div>
          <div className="flex justify-between">
  <span className="text-sm text-gray-600 dark:text-gray-300">Expires</span>
  <span className={`font-semibold ${daysUntil < 0 ? 'text-red-600 dark:text-red-400' : daysUntil < 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
    {formatDate(warranty.expirationDate)}
  </span>
</div>
          <div className="flex justify-between">
  <span className="text-sm text-gray-600 dark:text-gray-300">Days left</span>
  <span className={`font-semibold ${daysUntil < 0 ? 'text-red-600 dark:text-red-400' : daysUntil < 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
    {daysUntil} days
  </span>
</div>
<div className="flex justify-between items-center">
  <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
  <Badge className={urgencyColor}>
    {status}
  </Badge>
</div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => extendMutation.mutate()}
            disabled={extendMutation.isPending}
          >
            {extendMutation.isPending ? "Extending..." : "Extend Warranty"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
