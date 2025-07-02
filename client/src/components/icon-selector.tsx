import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';

// Get all available Lucide icons dynamically
const getAllLucideIcons = () => {
  return Object.keys(LucideIcons).filter(key => 
    key !== 'createLucideIcon' && 
    key !== 'default' && 
    typeof (LucideIcons as any)[key] === 'function'
  ).sort();
};

interface IconSelectorProps {
  selectedIcon?: {
    name: string;
    position: 'left' | 'right';
    size: number;
    svg: string;
  } | null;
  onIconChange: (icon: {
    name: string;
    position: 'left' | 'right';
    size: number;
    svg: string;
  } | null) => void;
}

export function IconSelector({ selectedIcon, onIconChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [iconPosition, setIconPosition] = useState<'left' | 'right'>(selectedIcon?.position || 'left');
  const [iconSize, setIconSize] = useState(selectedIcon?.size || 16);
  const [allIcons] = useState(() => getAllLucideIcons());

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return allIcons.filter((iconName: string) =>
      iconName.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, allIcons]);

  // Virtual scrolling state
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const itemsPerRow = 6;
  const itemHeight = 36; // Height of each icon button including gap
  const containerHeight = 192; // Height of scroll container (h-48 = 192px)
  const visibleRows = Math.ceil(containerHeight / itemHeight) + 2; // Buffer rows
  const totalRows = Math.ceil(filteredIcons.length / itemsPerRow);
  const visibleItemsCount = visibleRows * itemsPerRow;

  // Calculate visible items for current scroll position
  const visibleIcons = useMemo(() => {
    const startIndex = Math.max(0, visibleStartIndex);
    const endIndex = Math.min(filteredIcons.length, startIndex + visibleItemsCount);
    const result = filteredIcons.slice(startIndex, endIndex);
    console.log('Icon selector debug:', {
      allIconsCount: allIcons.length,
      filteredIconsCount: filteredIcons.length,
      visibleIconsCount: result.length,
      startIndex,
      endIndex,
      searchTerm
    });
    return result;
  }, [filteredIcons, visibleStartIndex, visibleItemsCount, allIcons.length, searchTerm]);

  // Handle scroll event for virtual scrolling
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const newStartRow = Math.floor(scrollTop / itemHeight);
    const newStartIndex = newStartRow * itemsPerRow;
    setVisibleStartIndex(newStartIndex);
  }, [itemHeight, itemsPerRow]);

  // Get icon component and SVG content by rendering to string
  const getIconData = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;

    // Create a temporary container to render the icon and extract SVG
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);
    
    try {
      // Use React DOM to render the icon
      const iconElement = React.createElement(IconComponent, { 
        size: iconSize,
        'data-testid': 'temp-icon'
      });
      
      // Create a simple SVG representation 
      // Note: In a real implementation, you'd want to use ReactDOMServer.renderToString
      // For now, we'll use a template-based approach
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}"></svg>`;
      
      return {
        component: IconComponent,
        svg: svgContent
      };
    } finally {
      // Clean up the temporary element
      document.body.removeChild(tempDiv);
    }
  };

  const handleIconSelect = (iconName: string) => {
    const iconData = getIconData(iconName);
    if (!iconData) return;

    onIconChange({
      name: iconName,
      position: iconPosition,
      size: iconSize,
      svg: iconData.svg
    });
    setIsOpen(false);
  };

  const handleRemoveIcon = () => {
    onIconChange(null);
    setIsOpen(false);
  };

  // Update icon data when size or position changes
  useEffect(() => {
    if (selectedIcon) {
      const iconData = getIconData(selectedIcon.name);
      if (iconData) {
        onIconChange({
          name: selectedIcon.name,
          position: iconPosition,
          size: iconSize,
          svg: iconData.svg
        });
      }
    }
  }, [iconSize, iconPosition]);

  // Reset scroll position when search term changes
  useEffect(() => {
    setVisibleStartIndex(0);
  }, [searchTerm]);

  const SelectedIconComponent = selectedIcon ? (LucideIcons as any)[selectedIcon.name] : null;

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Icon</Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start h-8 text-xs"
          >
            {selectedIcon && SelectedIconComponent ? (
              <div className="flex items-center gap-2">
                <SelectedIconComponent size={selectedIcon.size} />
                <span>{selectedIcon.name}</span>
              </div>
            ) : (
              <span className="text-gray-500">Select an icon</span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            {/* Icon Position and Size Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Position</Label>
                <Select value={iconPosition} onValueChange={(value: 'left' | 'right') => setIconPosition(value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs font-medium">Size</Label>
                <Select value={iconSize.toString()} onValueChange={(value) => setIconSize(Number(value))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="24">24px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search */}
            <div>
              <Label className="text-xs font-medium">Search Icons</Label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search icons..."
                className="mt-1 h-8 text-xs"
              />
            </div>

            {/* Icon Grid */}
            <ScrollArea className="h-48 w-full">
              <div className="grid grid-cols-6 gap-2 p-1">
                {/* First, show a few common icons as test */}
                {['User', 'Mail', 'Phone', 'Search', 'Settings', 'Home', 'Heart', 'Star'].map((iconName: string) => {
                  const IconComponent = (LucideIcons as any)[iconName];
                  if (!IconComponent) {
                    console.log('Test icon not found:', iconName);
                    return (
                      <div key={iconName} className="h-8 w-8 border border-red-500 text-xs flex items-center justify-center">
                        {iconName.slice(0, 1)}
                      </div>
                    );
                  }

                  return (
                    <Button
                      key={iconName}
                      variant="ghost"
                      size="sm" 
                      className="h-8 w-8 p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleIconSelect(iconName)}
                      title={iconName}
                    >
                      <IconComponent size={16} />
                    </Button>
                  );
                })}
                
                {/* Show filtered icons */}
                {filteredIcons.slice(0, 40).map((iconName: string) => {
                  const IconComponent = (LucideIcons as any)[iconName];
                  if (!IconComponent) {
                    console.log('Filtered icon not found:', iconName);
                    return (
                      <div key={iconName} className="h-8 w-8 border border-orange-500 text-xs flex items-center justify-center">
                        {iconName.slice(0, 1)}
                      </div>
                    );
                  }

                  return (
                    <Button
                      key={iconName}
                      variant="ghost"
                      size="sm" 
                      className="h-8 w-8 p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleIconSelect(iconName)}
                      title={iconName}
                    >
                      <IconComponent size={16} />
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {selectedIcon && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveIcon}
                  className="flex-1 h-8 text-xs"
                >
                  Remove Icon
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1 h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}