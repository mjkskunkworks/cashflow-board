import React, { useState, useMemo } from "react";
import { ICON_CATALOG } from "../lib/iconCatalog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string | null) => void;
  currentIconName: string | null;
}

export const IconPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  currentIconName,
}: IconPickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return ICON_CATALOG;
    }

    const query = searchQuery.toLowerCase().trim();
    return ICON_CATALOG.filter((icon) => {
      const nameMatch = icon.name.toLowerCase().includes(query);
      const labelMatch = icon.label.toLowerCase().includes(query);
      const keywordsMatch = icon.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(query)
      );
      return nameMatch || labelMatch || keywordsMatch;
    });
  }, [searchQuery]);

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  const handleClear = () => {
    onSelect(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-popover text-popover-foreground max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-h3 text-foreground">
            Choose Icon
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 flex-1 min-h-0">
          {/* Search input */}
          <div className="space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
              placeholder="Search icons..."
              autoFocus
            />
          </div>

          {/* Icon grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-5 gap-3">
                {filteredIcons.map((icon) => {
                  const isSelected = currentIconName === icon.name;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleSelect(icon.name)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-md border-2 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-ring ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground hover:bg-secondary"
                      }`}
                      aria-label={icon.label}
                      title={icon.label}
                    >
                      <span
                        className="material-symbols-rounded icon-modal"
                        style={{ color: "#18191B" }}
                      >
                        {icon.name}
                      </span>
                      <span className="text-xs text-foreground text-center truncate w-full">
                        {icon.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No icons found
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleClear}
            className="bg-transparent text-foreground border border-border hover:bg-secondary h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Clear
          </Button>
          <div className="flex gap-2 flex-1 sm:justify-end">
            <Button
              onClick={onClose}
              className="bg-transparent text-foreground border border-border hover:bg-secondary h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

