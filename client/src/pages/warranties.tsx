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
import type { Warranty } from "@shared/schema";

export default function WarrantiesPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | undefined>();

  const { data: warranties, isLoading } = useQuery({
    queryKey: ["/api/warranties", user?.id],
    enabled: !!user?.id,
  });

  const handleEdit = (warranty: Warranty) => {
    setEditingWarranty(warranty);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingWarranty(undefined);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warranties</h1>
            <p className="text-gray-600">Track your product warranties and protection plans</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Warranty
          </Button>
        </div>

        {/* Warranties Grid */}
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
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : warranties?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warranties.map((warranty: Warranty) => (
              <WarrantyCard 
                key={warranty.id} 
                warranty={warranty}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No warranties found</h3>
            <p className="text-gray-600 mb-4">
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
