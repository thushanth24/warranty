import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Calendar as CalendarIcon, X, Save, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface SearchFilter {
  field: string;
  operator: "equals" | "contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "between" | "is_null" | "is_not_null";
  value: any;
  type: "text" | "number" | "date" | "select" | "boolean";
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilter[];
  createdAt: Date;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilter[]) => void;
  onSaveSearch?: (search: SavedSearch) => void;
  savedSearches?: SavedSearch[];
  onLoadSearch?: (search: SavedSearch) => void;
  fieldOptions: {
    value: string;
    label: string;
    type: "text" | "number" | "date" | "select" | "boolean";
    options?: { value: string; label: string; }[];
  }[];
  placeholder?: string;
}

export function AdvancedSearch({
  onSearch,
  onSaveSearch,
  savedSearches = [],
  onLoadSearch,
  fieldOptions,
  placeholder = "Search..."
}: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [quickSearch, setQuickSearch] = useState("");
  const [searchName, setSearchName] = useState("");

  const operatorOptions = {
    text: [
      { value: "contains", label: "Contains" },
      { value: "equals", label: "Equals" },
      { value: "starts_with", label: "Starts with" },
      { value: "ends_with", label: "Ends with" },
      { value: "is_null", label: "Is empty" },
      { value: "is_not_null", label: "Is not empty" },
    ],
    number: [
      { value: "equals", label: "Equals" },
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "between", label: "Between" },
      { value: "is_null", label: "Is empty" },
      { value: "is_not_null", label: "Is not empty" },
    ],
    date: [
      { value: "equals", label: "On date" },
      { value: "greater_than", label: "After" },
      { value: "less_than", label: "Before" },
      { value: "between", label: "Between dates" },
      { value: "is_null", label: "No date set" },
      { value: "is_not_null", label: "Has date" },
    ],
    select: [
      { value: "equals", label: "Is" },
      { value: "is_null", label: "Not selected" },
      { value: "is_not_null", label: "Is selected" },
    ],
    boolean: [
      { value: "equals", label: "Is" },
    ],
  };

  const addFilter = () => {
    setFilters([...filters, {
      field: fieldOptions[0]?.value || "",
      operator: "contains",
      value: "",
      type: fieldOptions[0]?.type || "text",
    }]);
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    const allFilters = [...filters];
    
    // Add quick search as a general text filter if present
    if (quickSearch.trim()) {
      const textFields = fieldOptions.filter(f => f.type === "text");
      if (textFields.length > 0) {
        allFilters.push({
          field: "global_search",
          operator: "contains",
          value: quickSearch,
          type: "text",
        });
      }
    }
    
    onSearch(allFilters);
    setIsOpen(false);
  };

  const handleSaveSearch = () => {
    if (searchName.trim() && onSaveSearch) {
      const savedSearch: SavedSearch = {
        id: Date.now().toString(),
        name: searchName,
        filters: [...filters],
        createdAt: new Date(),
      };
      onSaveSearch(savedSearch);
      setSearchName("");
    }
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setFilters([...search.filters]);
    if (onLoadSearch) {
      onLoadSearch(search);
    }
  };

  const activeFiltersCount = filters.length + (quickSearch ? 1 : 0);

  return (
    <div className="flex gap-2">
      {/* Quick Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          className="pl-10"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
      </div>

      {/* Advanced Search Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Advanced
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Search & Filters</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Saved Searches</Label>
                <div className="flex flex-wrap gap-2">
                  {savedSearches.map((search) => (
                    <Button
                      key={search.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadSearch(search)}
                      className="text-xs"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      {search.name}
                    </Button>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            )}

            {/* Filters */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium">Search Filters</Label>
                <Button onClick={addFilter} size="sm" variant="outline">
                  Add Filter
                </Button>
              </div>

              {filters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No filters added yet</p>
                  <p className="text-sm">Click "Add Filter" to create advanced search criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex gap-2 items-start p-4 border rounded-lg">
                      {/* Field Selection */}
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500 mb-1 block">Field</Label>
                        <Select
                          value={filter.field}
                          onValueChange={(value) => {
                            const fieldOption = fieldOptions.find(f => f.value === value);
                            updateFilter(index, { 
                              field: value, 
                              type: fieldOption?.type || "text",
                              value: "" 
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator Selection */}
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500 mb-1 block">Condition</Label>
                        <Select
                          value={filter.operator}
                          onValueChange={(value: any) => updateFilter(index, { operator: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operatorOptions[filter.type]?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Value Input */}
                      {!["is_null", "is_not_null"].includes(filter.operator) && (
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500 mb-1 block">Value</Label>
                          {filter.type === "text" || filter.type === "number" ? (
                            <Input
                              type={filter.type === "number" ? "number" : "text"}
                              value={filter.value}
                              onChange={(e) => updateFilter(index, { value: e.target.value })}
                              placeholder="Enter value..."
                            />
                          ) : filter.type === "date" ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !filter.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {filter.value ? format(new Date(filter.value), "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={filter.value ? new Date(filter.value) : undefined}
                                  onSelect={(date) => updateFilter(index, { value: date?.toISOString() })}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          ) : filter.type === "select" ? (
                            <Select
                              value={filter.value}
                              onValueChange={(value) => updateFilter(index, { value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select option..." />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldOptions.find(f => f.value === filter.field)?.options?.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : filter.type === "boolean" ? (
                            <Select
                              value={filter.value?.toString()}
                              onValueChange={(value) => updateFilter(index, { value: value === "true" })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : null}
                        </div>
                      )}

                      {/* Remove Filter */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(index)}
                        className="mt-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Search */}
            {onSaveSearch && filters.length > 0 && (
              <div>
                <Separator className="mb-4" />
                <div className="flex gap-2">
                  <Input
                    placeholder="Save this search as..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveSearch} disabled={!searchName.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Search
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setFilters([]);
                setQuickSearch("");
                onSearch([]);
              }} variant="outline">
                Clear All
              </Button>
              <Button onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}