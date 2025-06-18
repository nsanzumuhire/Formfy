
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, Settings, Eye, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormToolbarProps {
  formConfig: any;
  setFormConfig: (config: any) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (preview: boolean) => void;
  onSave: () => void;
}

export function FormToolbar({
  formConfig,
  setFormConfig,
  isPreviewMode,
  setIsPreviewMode,
  onSave,
}: FormToolbarProps) {
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [spacingOpen, setSpacingOpen] = useState(false);

  return (
    <div className="h-12 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        {/* Layout Type Combobox */}
        <div className="flex items-center gap-2">
          <Popover open={layoutOpen} onOpenChange={setLayoutOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={layoutOpen}
                className="w-40 h-8 justify-between"
              >
                {formConfig.layout === "single-column"
                  ? "Single"
                  : formConfig.layout === "two-column"
                    ? "Two Col"
                    : formConfig.layout === "grid"
                      ? "Grid"
                      : formConfig.layout === "auto"
                        ? "Auto"
                        : "Form layout"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0">
              <Command>
                <CommandGroup>
                  {["single-column", "two-column", "grid", "auto"].map((layout) => (
                    <CommandItem
                      key={layout}
                      value={layout}
                      onSelect={() => {
                        setFormConfig({ ...formConfig, layout });
                        setLayoutOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formConfig.layout === layout ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {layout === "single-column" ? "Single" : 
                       layout === "two-column" ? "Two Col" :
                       layout === "grid" ? "Grid" : "Auto"}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {formConfig.layout === "grid" && (
            <Input
              type="number"
              value={formConfig.gridColumns}
              onChange={(e) =>
                setFormConfig({
                  ...formConfig,
                  gridColumns: parseInt(e.target.value) || 2,
                })
              }
              className="w-16 h-8"
              min="2"
              max="6"
            />
          )}
        </div>

        {/* Field Spacing */}
        <div className="flex items-center gap-2">
          <Popover open={spacingOpen} onOpenChange={setSpacingOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={spacingOpen}
                className="w-44 h-8 justify-between"
              >
                {formConfig.spacing}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-0">
              <Command>
                <CommandGroup>
                  {["2px", "4px", "8px", "12px", "custom"].map((spacing) => (
                    <CommandItem
                      key={spacing}
                      value={spacing}
                      onSelect={() => {
                        setFormConfig({ ...formConfig, spacing });
                        setSpacingOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formConfig.spacing === spacing ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {spacing}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {formConfig.spacing === "custom" && (
            <Input
              type="number"
              value={formConfig.customSpacing}
              onChange={(e) =>
                setFormConfig({
                  ...formConfig,
                  customSpacing: parseInt(e.target.value) || 8,
                })
              }
              className="w-16 h-8"
              min="0"
              max="100"
            />
          )}
        </div>

        {/* Show Labels Toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-labels"
            checked={formConfig.showLabels}
            onCheckedChange={(checked) => {
              setFormConfig({
                ...formConfig,
                showLabels: !!checked,
              });
            }}
          />
          <Label htmlFor="show-labels" className="text-xs cursor-pointer">
            Show Labels
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Button Configuration */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Settings className="w-4 h-4 mr-1" />
              Buttons
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            {/* Button configuration content */}
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
        >
          <Eye className="w-4 h-4 mr-1" />
          {isPreviewMode ? "Edit" : "Preview"}
        </Button>
        <Button size="sm" onClick={onSave}>
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}
