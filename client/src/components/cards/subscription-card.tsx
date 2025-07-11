import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Subscription } from "@shared/schema";
import { formatCurrency, formatDate, getDaysUntil, getUrgencyColor, getUrgencyStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CreditCard } from "lucide-react";
import { FaSpotify, FaDropbox, FaApple, FaGoogle, FaMicrosoft } from "react-icons/fa6";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
}

const getServiceIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('netflix')) return <CreditCard className="text-red-600" />;
  if (lowerName.includes('spotify')) return <FaSpotify className="text-green-600" />;
  if (lowerName.includes('dropbox')) return <FaDropbox className="text-blue-600" />;
  if (lowerName.includes('apple') || lowerName.includes('icloud')) return <FaApple className="text-gray-800" />;
  if (lowerName.includes('google') || lowerName.includes('drive')) return <FaGoogle className="text-blue-500" />;
  if (lowerName.includes('microsoft') || lowerName.includes('office')) return <FaMicrosoft className="text-blue-600" />;
  return <CreditCard className="text-gray-600" />;
};

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'entertainment': return 'bg-purple-100 text-purple-800';
    case 'productivity': return 'bg-blue-100 text-blue-800';
    case 'cloud-storage': return 'bg-cyan-100 text-cyan-800';
    case 'software': return 'bg-gray-100 text-gray-800';
    case 'fitness': return 'bg-green-100 text-green-800';
    case 'education': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function SubscriptionCard({ subscription, onEdit }: SubscriptionCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const daysUntil = getDaysUntil(subscription.nextRenewalDate);
  const urgencyColor = getUrgencyColor(daysUntil);
  const status = getUrgencyStatus(daysUntil);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/subscriptions/${user?.id}/${subscription.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Subscription deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete subscription",
        variant: "destructive" 
      });
    },
  });

  const renewMutation = useMutation({
    mutationFn: () => {
      const nextDate = new Date(subscription.nextRenewalDate);
      switch (subscription.billingCycle) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
      return apiRequest("PUT", `/api/subscriptions/${user?.id}/${subscription.id}`, {
        nextRenewalDate: nextDate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming", user?.id] });
      toast({ title: "Success", description: "Subscription renewed successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to renew subscription",
        variant: "destructive" 
      });
    },
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center text-xl">
              {getServiceIcon(subscription.name)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
              {subscription.category && (
                <Badge variant="secondary" className={getCategoryColor(subscription.category)}>
                  {subscription.category.replace('-', ' ')}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit?.(subscription)}
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
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(subscription.amount)}/{subscription.billingCycle}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Next Due</span>
            <span className="font-medium text-gray-900">
              {formatDate(subscription.nextRenewalDate)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status</span>
            <Badge className={urgencyColor}>
              {status}
            </Badge>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => renewMutation.mutate()}
            disabled={renewMutation.isPending}
          >
            {renewMutation.isPending ? "Renewing..." : "Mark as Renewed"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
