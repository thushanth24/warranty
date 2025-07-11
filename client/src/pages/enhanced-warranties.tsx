import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Plus, 
  Search, 
  FileText, 
  AlertCircle, 
  Calendar,
  DollarSign,
  Building,
  Phone,
  Mail,
  Globe,
  Camera,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  User
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { getDaysUntil, getUrgencyColor, formatDate, formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import EnhancedWarrantyForm from "@/components/forms/enhanced-warranty-form";
import type { Warranty, WarrantyClaim } from "@shared/schema";

interface WarrantyClaimFormData {
  issueDescription: string;
  claimAmount?: number;
  vendorResponse?: string;
  resolution?: string;
  status: string;
}

export default function EnhancedWarrantiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | undefined>();
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | undefined>();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTo, setTransferTo] = useState("");

  const { data: warranties, isLoading } = useQuery({
    queryKey: ["/api/warranties", user?.id],
    enabled: !!user?.id,
  });

  const { data: selectedWarrantyClaims } = useQuery({
    queryKey: ["/api/warranties", selectedWarranty?.id, "claims"],
    enabled: !!selectedWarranty?.id,
  });

  const deleteWarrantyMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/warranties/${user?.id}/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", user?.id] });
      toast({
        title: "Warranty Deleted",
        description: "The warranty has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the warranty. Please try again.",
        variant: "destructive",
      });
    },
  });

  const transferWarrantyMutation = useMutation({
    mutationFn: async ({ warrantyId, transferTo }: { warrantyId: number, transferTo: string }) => {
      return await apiRequest(`/api/warranties/${user?.id}/${warrantyId}`, {
        method: "PUT",
        body: JSON.stringify({
          isTransferred: true,
          transferredTo: transferTo,
          transferDate: new Date(),
          transferNotes: `Transferred to ${transferTo}`,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", user?.id] });
      setShowTransferModal(false);
      setTransferTo("");
      toast({
        title: "Warranty Transferred",
        description: "The warranty has been transferred successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Transfer Failed",
        description: "Could not transfer the warranty. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createClaimMutation = useMutation({
    mutationFn: async (claimData: WarrantyClaimFormData & { warrantyId: number }) => {
      return await apiRequest(`/api/warranties/${claimData.warrantyId}/claims`, {
        method: "POST",
        body: JSON.stringify({
          ...claimData,
          userId: user?.id,
          claimDate: new Date(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", selectedWarranty?.id, "claims"] });
      toast({
        title: "Claim Created",
        description: "Your warranty claim has been submitted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Claim Failed",
        description: "Could not create the warranty claim. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredWarranties = (warranties || []).filter((warranty: Warranty) => {
    const matchesSearch = warranty.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (warranty.brand && warranty.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && warranty.isActive && !warranty.isTransferred) ||
                         (statusFilter === "transferred" && warranty.isTransferred) ||
                         (statusFilter === "expired" && getDaysUntil(warranty.expirationDate) < 0);
    
    const matchesCategory = categoryFilter === "all" || warranty.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (warranty: Warranty) => {
    if (warranty.isTransferred) {
      return <Badge variant="outline" className="border-blue-500 text-blue-700">Transferred</Badge>;
    }
    
    const daysUntil = getDaysUntil(warranty.expirationDate);
    if (daysUntil < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntil <= 30) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
    } else {
      return <Badge variant="outline" className="border-green-500 text-green-700">Active</Badge>;
    }
  };

  const getUrgencyIcon = (warranty: Warranty) => {
    const daysUntil = getDaysUntil(warranty.expirationDate);
    if (daysUntil < 0) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (daysUntil <= 30) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const categories = Array.from(new Set((warranties || []).map((w: Warranty) => w.category).filter(Boolean)));

  if (!user) {
    return <div>Please log in to view warranties.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Warranties</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track warranties with complete vendor info, documents, and claim management
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingWarranty(undefined)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Warranty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWarranty ? "Edit Warranty" : "Add New Warranty"}
              </DialogTitle>
            </DialogHeader>
            <EnhancedWarrantyForm
              warranty={editingWarranty}
              onSuccess={() => {
                setIsFormOpen(false);
                setEditingWarranty(undefined);
              }}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingWarranty(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search warranties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Warranties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWarranties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No warranties found</h3>
            <p className="text-gray-600 mb-4">Start tracking your product warranties with our enhanced system.</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Warranty
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarranties.map((warranty: Warranty) => (
            <Card key={warranty.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getUrgencyIcon(warranty)}
                    <CardTitle className="text-lg">{warranty.productName}</CardTitle>
                  </div>
                  {getStatusBadge(warranty)}
                </div>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    {warranty.vendor}
                  </div>
                  {warranty.brand && (
                    <div className="text-sm text-gray-600">Brand: {warranty.brand}</div>
                  )}
                  {warranty.category && (
                    <Badge variant="outline" className="text-xs">
                      {warranty.category}
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expires:</span>
                    <span className={`font-medium ${getUrgencyColor(getDaysUntil(warranty.expirationDate))}`}>
                      {formatDate(warranty.expirationDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Days left:</span>
                    <span className={`font-medium ${getUrgencyColor(getDaysUntil(warranty.expirationDate))}`}>
                      {getDaysUntil(warranty.expirationDate)} days
                    </span>
                  </div>
                  {warranty.purchasePrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium">{formatCurrency(warranty.purchasePrice)}</span>
                    </div>
                  )}
                </div>

                {/* Document indicators */}
                <div className="flex gap-2">
                  {warranty.receiptPhotos && warranty.receiptPhotos.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Camera className="h-3 w-3 mr-1" />
                      {warranty.receiptPhotos.length} photos
                    </Badge>
                  )}
                  {warranty.warrantyDocuments && warranty.warrantyDocuments.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {warranty.warrantyDocuments.length} docs
                    </Badge>
                  )}
                </div>

                {/* Vendor contact info */}
                {(warranty.vendorEmail || warranty.vendorPhone || warranty.vendorWebsite) && (
                  <div className="pt-2 border-t space-y-1">
                    {warranty.vendorEmail && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${warranty.vendorEmail}`} className="hover:text-blue-600">
                          {warranty.vendorEmail}
                        </a>
                      </div>
                    )}
                    {warranty.vendorPhone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${warranty.vendorPhone}`} className="hover:text-blue-600">
                          {warranty.vendorPhone}
                        </a>
                      </div>
                    )}
                    {warranty.vendorWebsite && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Globe className="h-3 w-3" />
                        <a href={warranty.vendorWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          Visit Website <ExternalLink className="h-3 w-3 inline ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Transfer info */}
                {warranty.isTransferred && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <User className="h-3 w-3" />
                      Transferred to: {warranty.transferredTo}
                    </div>
                    {warranty.transferDate && (
                      <div className="text-xs text-gray-500">
                        On: {formatDate(warranty.transferDate)}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWarranty(warranty)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingWarranty(warranty);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteWarrantyMutation.mutate(warranty.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Warranty Details Modal */}
      {selectedWarranty && (
        <Dialog open={!!selectedWarranty} onOpenChange={() => setSelectedWarranty(undefined)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {selectedWarranty.productName}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Warranty Details</TabsTrigger>
                <TabsTrigger value="claims">Claims</TabsTrigger>
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Product Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Brand:</strong> {selectedWarranty.brand || "N/A"}</div>
                      <div><strong>Model:</strong> {selectedWarranty.model || "N/A"}</div>
                      <div><strong>Serial Number:</strong> {selectedWarranty.serialNumber || "N/A"}</div>
                      <div><strong>Category:</strong> {selectedWarranty.category || "N/A"}</div>
                      <div><strong>Purchase Price:</strong> {selectedWarranty.purchasePrice ? formatCurrency(selectedWarranty.purchasePrice) : "N/A"}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Vendor Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Vendor:</strong> {selectedWarranty.vendor}</div>
                      <div><strong>Email:</strong> {selectedWarranty.vendorEmail || "N/A"}</div>
                      <div><strong>Phone:</strong> {selectedWarranty.vendorPhone || "N/A"}</div>
                      <div><strong>Website:</strong> {selectedWarranty.vendorWebsite || "N/A"}</div>
                      <div><strong>Address:</strong> {selectedWarranty.vendorAddress || "N/A"}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Warranty Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><strong>Purchase Date:</strong> {formatDate(selectedWarranty.purchaseDate)}</div>
                    <div><strong>Duration:</strong> {selectedWarranty.warrantyDuration} months</div>
                    <div><strong>Expires:</strong> {formatDate(selectedWarranty.expirationDate)}</div>
                  </div>
                </div>

                {selectedWarranty.description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-sm text-gray-600">{selectedWarranty.description}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="claims" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Warranty Claims</h3>
                  <Button 
                    onClick={() => createClaimMutation.mutate({
                      warrantyId: selectedWarranty.id,
                      issueDescription: "Product issue description",
                      status: "submitted"
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Claim
                  </Button>
                </div>
                
                {selectedWarrantyClaims && selectedWarrantyClaims.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWarrantyClaims.map((claim: WarrantyClaim) => (
                      <Card key={claim.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">Claim #{claim.claimNumber || claim.id}</div>
                              <div className="text-sm text-gray-600">{formatDate(claim.claimDate)}</div>
                            </div>
                            <Badge variant={claim.status === 'approved' ? 'default' : 'secondary'}>
                              {claim.status}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{claim.issueDescription}</p>
                          {claim.claimAmount && (
                            <div className="text-sm">
                              <strong>Claim Amount:</strong> {formatCurrency(claim.claimAmount)}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No warranty claims yet</p>
                    <p className="text-sm">File a claim if you experience issues</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="transfer" className="space-y-4">
                {selectedWarranty.isTransferred ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Warranty Transferred</h3>
                    <p className="text-gray-600">
                      This warranty was transferred to: <strong>{selectedWarranty.transferredTo}</strong>
                    </p>
                    {selectedWarranty.transferDate && (
                      <p className="text-sm text-gray-500 mt-1">
                        Transfer Date: {formatDate(selectedWarranty.transferDate)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Transfer Warranty</h3>
                    <p className="text-sm text-gray-600">
                      Transfer this warranty to another person when selling or giving away the product.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Transfer to (name/email)"
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => transferWarrantyMutation.mutate({
                          warrantyId: selectedWarranty.id,
                          transferTo
                        })}
                        disabled={!transferTo.trim()}
                      >
                        Transfer
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}