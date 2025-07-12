import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Upload, Database, FileJson, Calendar, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

interface BackupData {
  metadata: {
    version: string;
    exportDate: string;
    userId: number;
    userEmail?: string;
  };
  subscriptions: any[];
  warranties: any[];
  reminders: any[];
  notifications: any[];
  notificationSettings: any[];
}

interface DataBackupProps {
  onBackupComplete?: () => void;
  onRestoreComplete?: () => void;
}

export function DataBackup({ onBackupComplete, onRestoreComplete }: DataBackupProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [selectedSections, setSelectedSections] = useState({
    subscriptions: true,
    warranties: true,
    reminders: true,
    notifications: false,
    notificationSettings: true,
  });

  const exportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    setExportProgress(0);

    try {
      const data: BackupData = {
        metadata: {
          version: "1.0",
          exportDate: new Date().toISOString(),
          userId: user.id,
          userEmail: user.email || undefined,
        },
        subscriptions: [],
        warranties: [],
        reminders: [],
        notifications: [],
        notificationSettings: [],
      };

      // Export each section if selected
      const sections = Object.keys(selectedSections).filter(
        key => selectedSections[key as keyof typeof selectedSections]
      );
      
      let completed = 0;
      
      for (const section of sections) {
        try {
          let endpoint = "";
          switch (section) {
            case "subscriptions":
              endpoint = `/api/subscriptions/${user.id}`;
              break;
            case "warranties":
              endpoint = `/api/warranties/${user.id}`;
              break;
            case "reminders":
              endpoint = `/api/reminders/${user.id}`;
              break;
            case "notifications":
              endpoint = `/api/users/${user.id}/notifications`;
              break;
            case "notificationSettings":
              endpoint = `/api/users/${user.id}/notification-settings`;
              break;
          }

          if (endpoint) {
            const response = await fetch(endpoint);
            if (response.ok) {
              const sectionData = await response.json();
              data[section as keyof BackupData] = Array.isArray(sectionData) ? sectionData : [sectionData];
            }
          }
        } catch (error) {
          console.error(`Failed to export ${section}:`, error);
        }
        
        completed++;
        setExportProgress((completed / sections.length) * 100);
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: "application/json" 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `subtracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Complete",
        description: "Your data has been exported successfully.",
      });

      onBackupComplete?.();
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate backup file structure
        if (!data.metadata || !data.metadata.version) {
          throw new Error("Invalid backup file format");
        }

        setBackupData(data);
        toast({
          title: "Backup File Loaded",
          description: "Ready to restore your data.",
        });
      } catch (error) {
        toast({
          title: "Invalid File",
          description: "Please select a valid SubTracker backup file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const restoreData = async () => {
    if (!backupData || !user) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const sections = Object.keys(selectedSections).filter(
        key => selectedSections[key as keyof typeof selectedSections] && 
              backupData[key as keyof BackupData] &&
              Array.isArray(backupData[key as keyof BackupData]) &&
              (backupData[key as keyof BackupData] as any[]).length > 0
      );

      let completed = 0;

      for (const section of sections) {
        try {
          const sectionData = backupData[section as keyof BackupData] as any[];
          
          for (const item of sectionData) {
            // Remove IDs to create new items
            const { id, createdAt, ...itemData } = item;
            
            let endpoint = "";
            switch (section) {
              case "subscriptions":
                endpoint = `/api/subscriptions/${user.id}`;
                break;
              case "warranties":
                endpoint = `/api/warranties/${user.id}`;
                break;
              case "reminders":
                endpoint = `/api/reminders/${user.id}`;
                break;
              case "notificationSettings":
                endpoint = `/api/users/${user.id}/notification-settings`;
                break;
            }

            if (endpoint) {
              await apiRequest(endpoint, {
                method: "POST",
                body: JSON.stringify(itemData),
              });
            }
          }
        } catch (error) {
          console.error(`Failed to restore ${section}:`, error);
        }

        completed++;
        setImportProgress((completed / sections.length) * 100);
      }

      toast({
        title: "Restore Complete",
        description: "Your data has been restored successfully.",
      });

      onRestoreComplete?.();
      setIsOpen(false);
      setBackupData(null);
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Failed to restore your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "subscriptions": return <Database className="h-4 w-4" />;
      case "warranties": return <Database className="h-4 w-4" />;
      case "reminders": return <Calendar className="h-4 w-4" />;
      case "notifications": return <AlertCircle className="h-4 w-4" />;
      case "notificationSettings": return <CheckCircle className="h-4 w-4" />;
      default: return <FileJson className="h-4 w-4" />;
    }
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case "subscriptions": return "Subscriptions";
      case "warranties": return "Warranties";
      case "reminders": return "Reminders";
      case "notifications": return "Notification History";
      case "notificationSettings": return "Notification Settings";
      default: return section;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Database className="h-4 w-4 mr-2" />
          Backup & Restore
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Data Backup & Restore</DialogTitle>
          <DialogDescription>
            Export your data for backup or import from a previous backup file.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Your Data</CardTitle>
                <CardDescription>
                  Download a backup file containing your selected data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Select Data to Export</Label>
                  <div className="space-y-3">
                    {Object.entries(selectedSections).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) =>
                            setSelectedSections(prev => ({ ...prev, [key]: !!checked }))
                          }
                        />
                        <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                          {getSectionIcon(key)}
                          {getSectionLabel(key)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {isExporting && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Exporting data...</span>
                    </div>
                    <Progress value={exportProgress} className="w-full" />
                  </div>
                )}

                <Button
                  onClick={exportData}
                  disabled={isExporting || !Object.values(selectedSections).some(Boolean)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import Data</CardTitle>
                <CardDescription>
                  Restore your data from a backup file.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {!backupData ? (
                  <div>
                    <Label htmlFor="backup-file" className="text-sm font-medium mb-2 block">
                      Select Backup File
                    </Label>
                    <Input
                      id="backup-file"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Select a .json backup file exported from SubTracker
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Backup file loaded from {new Date(backupData.metadata.exportDate).toLocaleDateString()}
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Data to Restore</Label>
                      <div className="space-y-3">
                        {Object.entries(selectedSections).map(([key, value]) => {
                          const dataCount = Array.isArray(backupData[key as keyof BackupData]) 
                            ? (backupData[key as keyof BackupData] as any[]).length 
                            : 0;
                          
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`restore-${key}`}
                                  checked={value && dataCount > 0}
                                  disabled={dataCount === 0}
                                  onCheckedChange={(checked) =>
                                    setSelectedSections(prev => ({ ...prev, [key]: !!checked }))
                                  }
                                />
                                <Label htmlFor={`restore-${key}`} className="flex items-center gap-2 cursor-pointer">
                                  {getSectionIcon(key)}
                                  {getSectionLabel(key)}
                                </Label>
                              </div>
                              <span className="text-sm text-gray-500">
                                {dataCount} items
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This will add the backup data to your existing data. Duplicate items may be created.
                      </AlertDescription>
                    </Alert>

                    {isImporting && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Restoring data...</span>
                        </div>
                        <Progress value={importProgress} className="w-full" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setBackupData(null)}
                        disabled={isImporting}
                        className="flex-1"
                      >
                        Choose Different File
                      </Button>
                      <Button
                        onClick={restoreData}
                        disabled={isImporting || !Object.values(selectedSections).some(Boolean)}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isImporting ? "Restoring..." : "Restore Data"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}