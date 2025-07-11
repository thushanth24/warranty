import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CreditCard, Shield, Calendar, AlertCircle, Mail, MessageSquare, Smartphone, Save, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { getDaysUntil, getUrgencyColor, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { Reminder, Subscription, Warranty, UserNotificationSettings, Notification } from "@shared/schema";

export default function RemindersPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reminderIntervals, setReminderIntervals] = useState("7,3,1");

  // Fetch notification settings
  const { data: notificationSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "notification-settings"],
    enabled: !!user?.id,
  });

  // Fetch active reminders
  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/reminders", user?.id],
    enabled: !!user?.id,
  });

  // Fetch notifications history
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "notifications"],
    enabled: !!user?.id,
  });

  // Fetch subscriptions and warranties for context
  const { data: subscriptions } = useQuery({
    queryKey: ["/api/subscriptions", user?.id],
    enabled: !!user?.id,
  });

  const { data: warranties } = useQuery({
    queryKey: ["/api/warranties", user?.id],
    enabled: !!user?.id,
  });

  // Update notification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<UserNotificationSettings>) => {
      return await apiRequest(`/api/users/${user?.id}/notification-settings`, {
        method: "PUT",
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "notification-settings"] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not save your notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: keyof UserNotificationSettings, value: boolean | string) => {
    const currentSettings = notificationSettings || {};
    updateSettingsMutation.mutate({
      ...currentSettings,
      [key]: value,
    });
  };

  const handleIntervalsSave = () => {
    // Validate intervals format
    const intervals = reminderIntervals.split(',').map(s => s.trim());
    const isValid = intervals.every(interval => {
      const num = parseInt(interval);
      return !isNaN(num) && num > 0;
    });

    if (!isValid) {
      toast({
        title: "Invalid Format",
        description: "Please enter comma-separated numbers (e.g., 30,7,3,1)",
        variant: "destructive",
      });
      return;
    }

    handleSettingChange('reminderIntervals', reminderIntervals);
  };

  const getItemName = (reminder: Reminder) => {
    if (reminder.itemType === 'subscription') {
      const subscription = subscriptions?.find((s: Subscription) => s.id === reminder.itemId);
      return subscription?.name || 'Unknown Subscription';
    } else {
      const warranty = warranties?.find((w: Warranty) => w.id === reminder.itemId);
      return warranty?.productName || 'Unknown Product';
    }
  };

  const getReminderDescription = (reminder: Reminder) => {
    const itemName = getItemName(reminder);
    const daysText = reminder.reminderDays === 1 ? '1 day' : `${reminder.reminderDays} days`;
    const actionText = reminder.itemType === 'subscription' ? 'renews' : 'expires';
    return `${itemName} ${actionText} in ${daysText}`;
  };

  const getReminderIcon = (reminder: Reminder) => {
    return reminder.itemType === 'subscription' ? CreditCard : Shield;
  };

  const getActiveReminders = () => {
    if (!reminders) return [];
    return reminders.filter((reminder: Reminder) => reminder.isActive);
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'push': return Smartphone;
      default: return Bell;
    }
  };

  const getNotificationStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please log in to view your reminders and notification settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage how and when you receive reminders
          </p>
        </div>
        <Settings className="h-8 w-8 text-gray-500" />
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you'd like to receive reminder notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settingsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <Label htmlFor="email-enabled" className="text-sm font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Receive reminders via email
                    </p>
                  </div>
                  <Switch
                    id="email-enabled"
                    checked={notificationSettings?.emailEnabled || false}
                    onCheckedChange={(checked) => handleSettingChange('emailEnabled', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <Label htmlFor="sms-enabled" className="text-sm font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Receive reminders via text
                    </p>
                  </div>
                  <Switch
                    id="sms-enabled"
                    checked={notificationSettings?.smsEnabled || false}
                    onCheckedChange={(checked) => handleSettingChange('smsEnabled', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <Label htmlFor="push-enabled" className="text-sm font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Browser notifications
                    </p>
                  </div>
                  <Switch
                    id="push-enabled"
                    checked={notificationSettings?.pushEnabled || false}
                    onCheckedChange={(checked) => handleSettingChange('pushEnabled', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="reminder-intervals" className="text-sm font-medium mb-2 block">
                  Reminder Schedule (days before expiration)
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Enter comma-separated numbers (e.g., 30,7,3,1 for 30 days, 7 days, 3 days, and 1 day before)
                </p>
                <div className="flex gap-2">
                  <Input
                    id="reminder-intervals"
                    value={reminderIntervals}
                    onChange={(e) => setReminderIntervals(e.target.value)}
                    placeholder="7,3,1"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleIntervalsSave}
                    disabled={updateSettingsMutation.isPending}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Current: {notificationSettings?.reminderIntervals || "7,3,1"}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Active Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Active Reminders
          </CardTitle>
          <CardDescription>
            Upcoming subscription renewals and warranty expirations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {remindersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : getActiveReminders().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active reminders</p>
              <p className="text-sm">Add subscriptions or warranties to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getActiveReminders().map((reminder: Reminder) => {
                const Icon = getReminderIcon(reminder);
                return (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{getReminderDescription(reminder)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reminder.reminderDays} days before {reminder.itemType} action
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {reminder.itemType}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Notification History
          </CardTitle>
          <CardDescription>
            Recent notifications sent to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notificationsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">Notifications will appear here once sent</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 10).map((notification: Notification) => {
                const TypeIcon = getNotificationTypeIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-4 border rounded-lg"
                  >
                    <TypeIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getNotificationStatusColor(notification.status)}`}
                          >
                            {notification.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      {notification.sentAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Sent: {formatDate(notification.sentAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}