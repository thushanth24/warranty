import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, CreditCard } from "lucide-react";
import SubscriptionForm from "@/components/forms/subscription-form";
import SubscriptionCard from "@/components/cards/subscription-card";
import type { Subscription } from "@shared/schema";

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("nextRenewalDate");

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions", user?.id],
    enabled: !!user?.id,
  });

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubscription(undefined);
  };

  const filteredSubscriptions = (subscriptions ?? []).filter((sub: Subscription) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || sub.category === categoryFilter;
    // Add status filtering logic here if needed
    return matchesSearch && matchesCategory;
  }).sort((a: Subscription, b: Subscription) => {
    switch (sortBy) {
      case "amount-high":
        return parseFloat(b.amount) - parseFloat(a.amount);
      case "amount-low":
        return parseFloat(a.amount) - parseFloat(b.amount);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime();
    }
  });

  return (
    <main className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Subscriptions</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your recurring subscriptions</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white dark:bg-gray-800 border-0 dark:shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 h-4 w-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search subscriptions..."
                    className="pl-10 bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="all">All Categories</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="entertainment">Entertainment</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="productivity">Productivity</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="cloud-storage">Cloud Storage</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="software">Software</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="fitness">Fitness</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="education">Education</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="all">All Status</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="active">Active</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="due-soon">Due Soon</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="nextRenewalDate">Next Due Date</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="amount-high">Amount (High to Low)</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="amount-low">Amount (Low to High)</SelectItem>
                    <SelectItem className="text-gray-900 dark:text-gray-100" value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSubscriptions?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription: Subscription) => (
              <SubscriptionCard 
                key={subscription.id} 
                subscription={subscription}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscriptions found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchTerm || categoryFilter ? 
                "Try adjusting your filters or search terms." :
                "Get started by adding your first subscription."
              }
            </p>
            {!searchTerm && !categoryFilter && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Subscription
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubscription ? "Edit Subscription" : "Add Subscription"}
            </DialogTitle>
          </DialogHeader>
          <SubscriptionForm 
            subscription={editingSubscription}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
