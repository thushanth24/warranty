import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Plus } from "lucide-react";
import WarrantyForm from "@/components/forms/warranty-form";
import WarrantyCard from "@/components/cards/warranty-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
// import type { Warranty } from "@shared/schema";

export default function WarrantiesPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<any | undefined>();

  const { data: warranties = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/warranties", user?.id],
    enabled: !!user?.id,
  });

  const handleEdit = (warranty: any) => {
    setEditingWarranty(warranty);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingWarranty(undefined);
  };

  return (
    <main className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Enhanced Warranties</h1>
<p className="text-gray-600 dark:text-gray-300">Track warranties with complete vendor info, documents, and claim management</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Warranty
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
          <div className="flex-1">
            <label htmlFor="warranty-search" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Search warranties</label>
            <div className="relative">
              <input
                id="warranty-search"
                type="text"
                placeholder="Search by product, brand, or vendor..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
              </span>
            </div>
          </div>
          <div className="w-full md:w-40">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Status</label>
            <select className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="w-full md:w-40">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Category</label>
            <select className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="appliances">Appliances</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        {/* Warranties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-gray-800 border-0 dark:shadow-lg">
                <CardContent className="p-6 text-gray-900 dark:text-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-xl dark:bg-gray-700" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1 dark:bg-gray-700" />
                        <Skeleton className="h-3 w-16 dark:bg-gray-700" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 dark:bg-gray-700" />
                      <Skeleton className="h-8 w-8 dark:bg-gray-700" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20 dark:bg-gray-700" />
                      <Skeleton className="h-3 w-24 dark:bg-gray-700" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-24 dark:bg-gray-700" />
                      <Skeleton className="h-3 w-16 dark:bg-gray-700" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16 dark:bg-gray-700" />
                      <Skeleton className="h-3 w-24 dark:bg-gray-700" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-12 dark:bg-gray-700" />
                      <Skeleton className="h-5 w-20 dark:bg-gray-700" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Skeleton className="h-8 w-full dark:bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : warranties.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(warranties as any[]).map((warranty: any) => (
              <WarrantyCard 
                key={warranty.id} 
                warranty={warranty}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No warranties found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Get started by adding your first warranty.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Warranty
            </Button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingWarranty ? "Edit Warranty" : "Add Warranty"}
            </DialogTitle>
          </DialogHeader>
          <WarrantyForm 
            warranty={editingWarranty}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
