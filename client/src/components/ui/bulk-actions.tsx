import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Archive, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsProps<T> {
  items: T[];
  selectedItems: Set<number>;
  onSelectionChange: (selectedIds: Set<number>) => void;
  onBulkEdit?: (selectedIds: number[]) => void;
  onBulkDelete?: (selectedIds: number[]) => void;
  onBulkArchive?: (selectedIds: number[]) => void;
  itemName: string; // e.g., "subscription", "warranty"
  getItemDisplay: (item: T) => string; // Function to get display name for item
}

export function BulkActions<T extends { id: number }>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkEdit,
  onBulkDelete,
  onBulkArchive,
  itemName,
  getItemDisplay,
}: BulkActionsProps<T>) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const selectedCount = selectedItems.size;
  const allSelected = items.length > 0 && selectedItems.size === items.length;
  const someSelected = selectedItems.size > 0 && selectedItems.size < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(item => item.id)));
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedItems));
      onSelectionChange(new Set());
      setShowDeleteConfirm(false);
      toast({
        title: "Items Deleted",
        description: `${selectedCount} ${itemName}${selectedCount === 1 ? '' : 's'} deleted successfully.`,
      });
    }
  };

  const handleBulkArchive = () => {
    if (onBulkArchive) {
      onBulkArchive(Array.from(selectedItems));
      onSelectionChange(new Set());
      setShowArchiveConfirm(false);
      toast({
        title: "Items Archived",
        description: `${selectedCount} ${itemName}${selectedCount === 1 ? '' : 's'} archived successfully.`,
      });
    }
  };

  const handleBulkEdit = () => {
    if (onBulkEdit) {
      onBulkEdit(Array.from(selectedItems));
      toast({
        title: "Bulk Edit",
        description: `Opening bulk edit for ${selectedCount} ${itemName}${selectedCount === 1 ? '' : 's'}.`,
      });
    }
  };

  const selectedItemsData = items.filter(item => selectedItems.has(item.id));

  if (items.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onCheckedChange={handleSelectAll}
            aria-label="Select all items"
          />
          
          {selectedCount > 0 && (
            <Badge variant="secondary" className="font-medium">
              {selectedCount} selected
            </Badge>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            {onBulkEdit && (
              <Button variant="outline" size="sm" onClick={handleBulkEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit ({selectedCount})
              </Button>
            )}
            
            {onBulkArchive && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowArchiveConfirm(true)}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive ({selectedCount})
              </Button>
            )}
            
            {onBulkDelete && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedCount})
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSelectionChange(new Set())}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedCount} {itemName}{selectedCount === 1 ? '' : 's'}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The following items will be permanently deleted:
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedItemsData.map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <CheckCircle className="h-4 w-4 text-red-500" />
                {getItemDisplay(item)}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete {selectedCount} {itemName}{selectedCount === 1 ? '' : 's'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive {selectedCount} {itemName}{selectedCount === 1 ? '' : 's'}?</DialogTitle>
            <DialogDescription>
              The following items will be moved to the archive:
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedItemsData.map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <Archive className="h-4 w-4 text-blue-500" />
                {getItemDisplay(item)}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkArchive}>
              Archive {selectedCount} {itemName}{selectedCount === 1 ? '' : 's'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}