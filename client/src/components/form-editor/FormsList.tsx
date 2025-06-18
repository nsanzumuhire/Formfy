import { useState } from "react";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Copy, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@shared/schema";

interface FormsListProps {
  forms: Form[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateForm: () => void;
  onEditForm: (form: Form) => void;
  onDeleteForm: (form: Form) => void;
  onCopyForm: (form: Form) => void;
  onCopyLink: (form: Form) => void;
  projectId: string;
}

export function FormsList({
  forms,
  searchTerm,
  onSearchChange,
  onCreateForm,
  onEditForm,
  onDeleteForm,
  onCopyForm,
  onCopyLink,
  projectId,
}: FormsListProps) {
  const getFormStatusBadge = (form: Form) => {
    if (form.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
    } else {
      return <Badge variant="outline">Inactive</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Forms</h2>
          <Button size="sm" onClick={onCreateForm} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Form
          </Button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-3">
          {forms.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No forms found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateForm}
                className="mt-2"
              >
                Create your first form
              </Button>
            </div>
          ) : (
            forms.map((form) => (
              <Card key={form.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium line-clamp-1">
                        {form.name}
                      </CardTitle>
                      {form.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {form.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditForm(form)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCopyForm(form)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCopyLink(form)}>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteForm(form)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    {getFormStatusBadge(form)}
                    <span className="text-xs text-gray-400">
                      {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}