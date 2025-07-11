import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { formatCurrency, formatDate, getDaysUntil, getUrgencyColor, getUrgencyStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, DollarSign, Shield, Clock, Plus, Download, Bell, CalendarCheck } from "lucide-react";
import { FaSpotify, FaDropbox } from "react-icons/fa6";
import SubscriptionForm from "@/components/forms/subscription-form";
import WarrantyForm from "@/components/forms/warranty-form";
import { useLocation } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showWarrantyForm, setShowWarrantyForm] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats", user?.id],
    enabled: !!user?.id,
  });

  const { data: upcoming, isLoading: upcomingLoading } = useQuery({
    queryKey: ["/api/dashboard/upcoming", user?.id],
    enabled: !!user?.id,
  });

  const getServiceIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('netflix')) return <CreditCard className="text-red-600 text-lg" />;
    if (lowerName.includes('spotify')) return <FaSpotify className="text-green-600 text-lg" />;
    if (lowerName.includes('dropbox')) return <FaDropbox className="text-blue-600 text-lg" />;
    return <CreditCard className="text-gray-600 text-lg" />;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</p>
                  )}
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="text-primary text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-success font-medium">+0</span>
                <span className="text-gray-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Spend</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(stats?.monthlySpend || 0)}
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-success text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-success font-medium">$0.00</span>
                <span className="text-gray-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Warranties Tracked</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{stats?.activeWarranties || 0}</p>
                  )}
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="text-purple-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-warning font-medium">0</span>
                <span className="text-gray-600 ml-1">expiring soon</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Due This Week</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{stats?.dueThisWeek || 0}</p>
                  )}
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="text-warning text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-danger font-medium">0</span>
                <span className="text-gray-600 ml-1">overdue</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowSubscriptionForm(true)}
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <Plus className="text-primary text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">Add Subscription</span>
              </button>
              <button 
                onClick={() => setShowWarrantyForm(true)}
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <Shield className="text-primary text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">Add Warranty</span>
              </button>
              <button 
                onClick={() => setLocation("/reminders")}
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <Bell className="text-primary text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">Set Reminder</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-colors">
                <Download className="text-primary text-2xl mb-2" />
                <span className="text-sm font-medium text-gray-700">Export Data</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Renewals & Expirations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Renewals */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Renewals</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/subscriptions")}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  ))
                ) : upcoming?.upcomingRenewals?.length ? (
                  upcoming.upcomingRenewals.map((renewal: any) => {
                    const daysUntil = getDaysUntil(renewal.nextRenewalDate);
                    const urgencyColor = getUrgencyColor(daysUntil);
                    const status = getUrgencyStatus(daysUntil);
                    
                    return (
                      <div key={renewal.id} className={`flex items-center justify-between p-4 rounded-lg border ${urgencyColor.includes('red') ? 'border-red-200 bg-red-50' : urgencyColor.includes('orange') ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                            {getServiceIcon(renewal.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{renewal.name}</p>
                            <p className="text-sm text-gray-600">
                              {daysUntil < 0 ? `Overdue by ${Math.abs(daysUntil)} days` : 
                               daysUntil === 0 ? 'Due today' :
                               `Due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(renewal.amount)}</p>
                          <Badge className={urgencyColor}>
                            {status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming renewals</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Warranty Expirations */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Warranty Expirations</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/warranties")}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  ))
                ) : upcoming?.warrantyExpirations?.length ? (
                  upcoming.warrantyExpirations.map((warranty: any) => {
                    const daysUntil = getDaysUntil(warranty.expirationDate);
                    const urgencyColor = getUrgencyColor(daysUntil);
                    const status = getUrgencyStatus(daysUntil);
                    
                    return (
                      <div key={warranty.id} className={`flex items-center justify-between p-4 rounded-lg border ${urgencyColor.includes('red') ? 'border-red-200 bg-red-50' : urgencyColor.includes('orange') ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Shield className="text-gray-600 text-lg" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{warranty.productName}</p>
                            <p className="text-sm text-gray-600">
                              {daysUntil < 0 ? `Expired ${Math.abs(daysUntil)} days ago` : 
                               daysUntil === 0 ? 'Expires today' :
                               `Expires in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{warranty.vendor}</p>
                          <Badge className={urgencyColor}>
                            {status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No warranty expirations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showSubscriptionForm} onOpenChange={setShowSubscriptionForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subscription</DialogTitle>
          </DialogHeader>
          <SubscriptionForm 
            onSuccess={() => setShowSubscriptionForm(false)}
            onCancel={() => setShowSubscriptionForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showWarrantyForm} onOpenChange={setShowWarrantyForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Warranty</DialogTitle>
          </DialogHeader>
          <WarrantyForm 
            onSuccess={() => setShowWarrantyForm(false)}
            onCancel={() => setShowWarrantyForm(false)}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
