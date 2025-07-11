import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Shield, CreditCard, Trash2, Plus } from "lucide-react";
import type { Reminder, Subscription, Warranty } from "@shared/schema";

interface ReminderSettings {
  subscriptions: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
    onDate: boolean;
  };
  warranties: {
    thirtyDays: boolean;
    sevenDays: boolean;
    oneDay: boolean;
    onDate: boolean;
  };
}

export default function RemindersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<ReminderSettings>({
    subscriptions: {
      sevenDays: true,
      threeDays: true,
      oneDay: false,
      onDate: false,
    },
    warranties: {
      thirtyDays: true,
      sevenDays: true,
      oneDay: false,
      onDate: false,
    },
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/reminders", user?.id],
    enabled: !!user?.id,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["/api/subscriptions", user?.id],
    enabled: !!user?.id,
  });

  const { data: warranties } = useQuery({
    queryKey: ["/api/warranties", user?.id],
    enabled: !!user?.id,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would save to user preferences
      // For now, we'll just show a success message
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Reminder settings saved successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to save reminder settings",
        variant: "destructive" 
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (reminderId: number) => 
      apiRequest("DELETE", `/api/reminders/${user?.id}/${reminderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders", user?.id] });
      toast({ title: "Success", description: "Reminder deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete reminder",
        variant: "destructive" 
      });
    },
  });

  const handleSettingChange = (
    category: 'subscriptions' | 'warranties',
    setting: string,
    checked: boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: checked,
      },
    }));
  };

  const getItemName = (reminder: Reminder) => {
    if (reminder.itemType === 'subscription') {
      const subscription = subscriptions?.find((s: Subscription) => s.id === reminder.itemId);
      return subscription?.name || 'Unknown Subscription';
    } else {
      const warranty = warranties?.find((w: Warranty) => w.id === reminder.itemId);
      return warranty?.productName || 'Unknown Warranty';
    }
  };

  const getReminderDescription = (reminder: Reminder) => {
    const itemName = getItemName(reminder);
    const days = reminder.reminderDays;
    const type = reminder.itemType === 'subscription' ? 'renewal' : 'expiration';
    
    return `${itemName} ${type} reminder • Set for ${days} ${days === 1 ? 'day' : 'days'} before`;
  };

  const getReminderIcon = (reminder: Reminder) => {
    if (reminder.itemType === 'subscription') {
      return <CreditCard className="text-blue-600" />;
    } else {
      return <Shield className="text-purple-600" />;
    }
  };

  const getActiveReminders = () => {
    if (!reminders) return [];
    return reminders.filter((reminder: Reminder) => reminder.isActive);
  };

  return (
    <main className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
            <p className="text-gray-600">Configure notification preferences and reminder settings</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        </div>

        {/* Reminder Settings */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Default Reminder Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Subscription Renewals</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <Checkbox 
                      checked={settings.subscriptions.sevenDays}
                      onCheckedChange={(checked) => 
                        handleSettingChange('subscriptions', 'sevenDays', checked as boolean)
                      }
                    />
                    <span className="ml-3 text-sm text-gray-700">7 days before</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox 
                      checked={settings.subscriptions.threeDays}
                      onCheckedChange={(checked) => 
                        handleSettingChange('subscriptions', 'threeDays', checked as boolean)
                      }
                    />
                    <span className="ml-3 text-sm text-gray-700">3 days before</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox 
                      checked={settings.subscriptions.oneDay}
                      onCheckedChange={(checked) => 
                        handleSettingChange('subscriptions', 'oneDay', checked as boolean)
                      }
                    />
                    <span className="ml-3 text-sm text-gray-700">1 day before</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox 
                      checked={settings.subscriptions.onDate}
                      onCheckedChange={(checked) => 
                        handleSettingChange('subscriptions', 'onDate', checked as boolean)
                      }
                    />
                    <span className="ml-3 text-sm text-gray-700">On renewal date</span>
                  </label>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Warranty Expirations</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <Checkbox 
                      checked={settings.warranties.thirtyDays}
                      onCheckedChange={(checked) => 
                        handleSettingChange('warranties', 'thirtyDays', checked as boolean)
                      }
                    />
                    <span className="ml-3 text-sm text-gray-700">30 days before</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox 
                      checked={settings.warranties.sevenDays}
                      onCheckedChange={(checked) => 
                        handleSettingChange('warranties', 'sevenDays', checked as boolean)
                      }
                    />
                    <span className="ml-3 text-sm text-gray-700">7 days before</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox 
                      checked={settings.warranties.oneDay}
                      onCheckedChange={(checked) => 
                        handleSettingChange('warranties', 'oneDay', checked as boolean)
                      }
                    />
                    <span className="ml-3 text-sm text-gray-700">1 day before</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox 
                      checked={settings.warranties.onDate}
                      onCheckedChange={(checked) => 
                        handleSettingChange('warranties', 'onDate', checked as boolean)
                      }
                    />
                    <span className="ml-3 text-sm text-gray-700">On expiration date</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button 
                onClick={() => saveSettingsMutation.mutate()}
                disabled={saveSettingsMutation.isPending}
              >
                {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Reminders */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Active Reminders</h2>
            <div className="space-y-4">
              {remindersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))
              ) : getActiveReminders().length ? (
                getActiveReminders().map((reminder: Reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-warning rounded-lg flex items-center justify-center">
                        {getReminderIcon(reminder)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getReminderDescription(reminder)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Reminder will be sent {reminder.reminderDays} {reminder.reminderDays === 1 ? 'day' : 'days'} before {reminder.itemType === 'subscription' ? 'renewal' : 'expiration'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-success text-white">
                        Active
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteReminderMutation.mutate(reminder.id)}
                        disabled={deleteReminderMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No active reminders</h3>
                  <p className="text-gray-600 mb-4">
                    Your reminders will appear here once you add subscriptions or warranties.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
