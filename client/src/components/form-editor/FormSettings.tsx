import { useState } from "react";
import { Settings, Grid3X3, Rows, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FormConfig {
  layout: string;
  gridColumns: number;
  spacing: string;
  customSpacing: number;
  showLabels: boolean;
  buttonLayout: "left" | "center" | "right" | "justify" | "split";
  submitButtonText: string;
  cancelButtonText: string;
  submitButtonColor: string;
  cancelButtonColor: string;
  showCancelButton: boolean;
}

interface FormSettingsProps {
  config: FormConfig;
  onChange: (config: FormConfig) => void;
}

export function FormSettings({ config, onChange }: FormSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (updates: Partial<FormConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Form Settings
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {/* Layout Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Layout
            </h4>
            
            <div className="space-y-2">
              <Label>Form Layout</Label>
              <Select value={config.layout} onValueChange={(value) => updateConfig({ layout: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Layout</SelectItem>
                  <SelectItem value="single">Single Column</SelectItem>
                  <SelectItem value="grid">Grid Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.layout === "grid" && (
              <div className="space-y-2">
                <Label>Grid Columns: {config.gridColumns}</Label>
                <Slider
                  value={[config.gridColumns]}
                  onValueChange={(value) => updateConfig({ gridColumns: value[0] })}
                  min={1}
                  max={4}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Field Spacing</Label>
              <Select value={config.spacing} onValueChange={(value) => updateConfig({ spacing: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4px">Tight (4px)</SelectItem>
                  <SelectItem value="8px">Normal (8px)</SelectItem>
                  <SelectItem value="16px">Loose (16px)</SelectItem>
                  <SelectItem value="24px">Extra Loose (24px)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.spacing === "custom" && (
              <div className="space-y-2">
                <Label>Custom Spacing: {config.customSpacing}px</Label>
                <Slider
                  value={[config.customSpacing]}
                  onValueChange={(value) => updateConfig({ customSpacing: value[0] })}
                  min={0}
                  max={48}
                  step={2}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Rows className="w-4 h-4" />
              Display
            </h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showLabels"
                checked={config.showLabels}
                onCheckedChange={(checked) => updateConfig({ showLabels: checked as boolean })}
              />
              <Label htmlFor="showLabels">Show field labels</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showCancelButton"
                checked={config.showCancelButton}
                onCheckedChange={(checked) => updateConfig({ showCancelButton: checked as boolean })}
              />
              <Label htmlFor="showCancelButton">Show cancel button</Label>
            </div>
          </div>

          {/* Button Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Buttons
            </h4>
            
            <div className="space-y-2">
              <Label>Button Layout</Label>
              <Select value={config.buttonLayout} onValueChange={(value: any) => updateConfig({ buttonLayout: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Submit Button Text</Label>
              <Input
                value={config.submitButtonText}
                onChange={(e) => updateConfig({ submitButtonText: e.target.value })}
                placeholder="Submit"
              />
            </div>

            {config.showCancelButton && (
              <div className="space-y-2">
                <Label>Cancel Button Text</Label>
                <Input
                  value={config.cancelButtonText}
                  onChange={(e) => updateConfig({ cancelButtonText: e.target.value })}
                  placeholder="Cancel"
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}