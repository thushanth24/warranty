import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Upload, X, Plus, ShoppingCart, FileText, User, Building, Camera, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { insertWarrantySchema, type InsertWarranty, type Warranty } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { z } from "zod";

const enhancedWarrantySchema = insertWarrantySchema.extend({
  purchaseDate: z.string().min(1, "Purchase date is required"),
  expirationDate: z.string().min(1, "Expiration date is required"),
  warrantyDuration: z.number().min(1, "Warranty duration must be at least 1 month"),
  purchasePrice: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  category: z.string().optional(),
  vendorEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  vendorPhone: z.string().optional(),
  vendorWebsite: z.string().url("Invalid URL").optional().or(z.literal("")),
  vendorAddress: z.string().optional(),
});

type EnhancedWarrantyForm = z.infer<typeof enhancedWarrantySchema>;

interface EnhancedWarrantyFormProps {
  warranty?: Warranty;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const warrantyCategories = [
  "Electronics",
  "Appliances", 
  "Home & Garden",
  "Automotive",
  "Furniture",
  "Clothing",
  "Sports & Recreation",
  "Tools & Hardware",
  "Other"
];

export default function EnhancedWarrantyForm({ warranty, onSuccess, onCancel }: EnhancedWarrantyFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [receiptPhotos, setReceiptPhotos] = useState<string[]>(warranty?.receiptPhotos || []);
  const [warrantyDocuments, setWarrantyDocuments] = useState<string[]>(warranty?.warrantyDocuments || []);
  const [uploadingFile, setUploadingFile] = useState(false);

  const form = useForm<EnhancedWarrantyForm>({
    resolver: zodResolver(enhancedWarrantySchema),
    defaultValues: {
      productName: warranty?.productName || "",
      vendor: warranty?.vendor || "",
      description: warranty?.description || "",
      purchaseDate: warranty?.purchaseDate ? formatDate(warranty.purchaseDate) : "",
      expirationDate: warranty?.expirationDate ? formatDate(warranty.expirationDate) : "",
      warrantyDuration: warranty?.warrantyDuration || 12,
      purchasePrice: warranty?.purchasePrice?.toString() || "",
      brand: warranty?.brand || "",
      model: warranty?.model || "",
      serialNumber: warranty?.serialNumber || "",
      category: warranty?.category || "",
      vendorEmail: warranty?.vendorEmail || "",
      vendorPhone: warranty?.vendorPhone || "",
      vendorWebsite: warranty?.vendorWebsite || "",
      vendorAddress: warranty?.vendorAddress || "",
    },
  });

  const createWarrantyMutation = useMutation({
    mutationFn: async (data: EnhancedWarrantyForm) => {
      const warrantyData = {
        ...data,
        purchaseDate: new Date(data.purchaseDate),
        expirationDate: new Date(data.expirationDate),
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
        receiptPhotos: receiptPhotos,
        warrantyDocuments: warrantyDocuments,
      };

      if (warranty) {
        return await apiRequest(`/api/warranties/${user?.id}/${warranty.id}`, {
          method: "PUT",
          body: JSON.stringify(warrantyData),
        });
      } else {
        return await apiRequest(`/api/warranties/${user?.id}`, {
          method: "POST",
          body: JSON.stringify(warrantyData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties", user?.id] });
      toast({
        title: warranty ? "Warranty Updated" : "Warranty Added",
        description: warranty ? "Your warranty has been updated successfully." : "Your warranty has been added successfully.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save warranty. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File, type: 'receipt' | 'document') => {
    if (!file) return;
    
    setUploadingFile(true);
    try {
      // Create a mock file URL for demo purposes
      // In a real app, you would upload to a cloud storage service
      const fileUrl = URL.createObjectURL(file);
      const fileName = `${type}_${Date.now()}_${file.name}`;
      
      if (type === 'receipt') {
        setReceiptPhotos(prev => [...prev, fileName]);
      } else {
        setWarrantyDocuments(prev => [...prev, fileName]);
      }

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFile = (fileName: string, type: 'receipt' | 'document') => {
    if (type === 'receipt') {
      setReceiptPhotos(prev => prev.filter(f => f !== fileName));
    } else {
      setWarrantyDocuments(prev => prev.filter(f => f !== fileName));
    }
  };

  const calculateExpirationDate = (purchaseDate: string, durationMonths: number) => {
    if (!purchaseDate) return "";
    const purchase = new Date(purchaseDate);
    const expiration = new Date(purchase);
    expiration.setMonth(expiration.getMonth() + durationMonths);
    return expiration.toISOString().split('T')[0];
  };

  const onSubmit = (data: EnhancedWarrantyForm) => {
    createWarrantyMutation.mutate(data);
  };

  if (!user) {
    return <div>Please log in to add warranties.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {warranty ? "Edit Warranty" : "Add New Warranty"}
          </CardTitle>
          <CardDescription>
            Track your product warranties with complete vendor information and supporting documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., MacBook Pro 16-inch" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Apple" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., M2 Pro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Product serial number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {warrantyCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Price</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional product details..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Vendor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Vendor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor/Store Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Best Buy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="support@vendor.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorWebsite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://vendor.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="vendorAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Store address for warranty claims..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Warranty Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Warranty Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Date *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const duration = form.getValues("warrantyDuration");
                                if (duration) {
                                  const expirationDate = calculateExpirationDate(e.target.value, duration);
                                  form.setValue("expirationDate", expirationDate);
                                }
                              }}
                            />
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
                          <FormLabel>Warranty Duration (months) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value);
                                const purchaseDate = form.getValues("purchaseDate");
                                if (purchaseDate && value) {
                                  const expirationDate = calculateExpirationDate(purchaseDate, value);
                                  form.setValue("expirationDate", expirationDate);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expirationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Documents & Photos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Documents & Photos
                  </CardTitle>
                  <CardDescription>
                    Upload receipt photos and warranty documents for easy access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Receipt Photos */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Receipt Photos</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {receiptPhotos.map((photo, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {photo}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeFile(photo, 'receipt')}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="receipt-upload"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => handleFileUpload(file, 'receipt'));
                        }}
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload receipt photos</span>
                        <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                      </label>
                    </div>
                  </div>

                  {/* Warranty Documents */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Warranty Documents</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {warrantyDocuments.map((doc, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {doc}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeFile(doc, 'document')}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                        id="document-upload"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => handleFileUpload(file, 'document'));
                        }}
                      />
                      <label
                        htmlFor="document-upload"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload warranty documents</span>
                        <span className="text-xs text-gray-500">PDF, DOC, JPG up to 10MB</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={createWarrantyMutation.isPending || uploadingFile}
                >
                  {createWarrantyMutation.isPending ? "Saving..." : warranty ? "Update Warranty" : "Add Warranty"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}