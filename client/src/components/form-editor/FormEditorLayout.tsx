import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Save, Eye, PanelRightOpen } from "lucide-react";

interface FormEditorLayoutProps {
  children: ReactNode;
  showFormsList: boolean;
  showPropertiesPanel: boolean;
  onToggleFormsList: () => void;
  onTogglePropertiesPanel: () => void;
  onSave: () => void;
  onPreview: () => void;
  canSave: boolean;
}

export function FormEditorLayout({
  children,
  showFormsList,
  showPropertiesPanel,
  onToggleFormsList,
  onTogglePropertiesPanel,
  onSave,
  onPreview,
  canSave,
}: FormEditorLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Forms List Sidebar */}
      <div
        className={`${
          showFormsList ? "w-80" : "w-0"
        } transition-all duration-200 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden`}
      >
        {children}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFormsList}
              className="flex items-center gap-2"
            >
              <PanelRightOpen className="w-4 h-4" />
              {showFormsList ? "Hide" : "Show"} Forms
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={!canSave}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Form
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePropertiesPanel}
              className="flex items-center gap-2"
            >
              <PanelRightOpen className="w-4 h-4" />
              Properties
            </Button>
          </div>
        </div>

        {/* Canvas Content */}
        <div className="flex-1 flex">
          <div className="flex-1">{children}</div>
          
          {/* Properties Panel */}
          <div
            className={`${
              showPropertiesPanel ? "w-80" : "w-0"
            } transition-all duration-200 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}