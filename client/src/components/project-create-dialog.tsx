import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProjectSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const formSchema = createProjectSchema.extend({
  name: z.string().min(1, "Project name is required").max(50, "Name must be less than 50 characters"),
  description: z.string().optional(),
});

type CreateProjectForm = z.infer<typeof formSchema>;

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProjectCreateDialog({ open, onOpenChange, onSuccess }: ProjectCreateDialogProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: (newProject: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onOpenChange(false);
      form.reset();
      
      toast({
        title: "Project created",
        description: `${newProject.name} has been created successfully.`,
      });

      // Call onSuccess callback if provided
      onSuccess?.();

      // If not on projects page, redirect there
      if (!window.location.pathname.includes("/projects")) {
        setLocation("/projects");
      }
    },
    onError: (error) => {
      toast({
        title: "Error creating project",
        description: error.message || "Failed to create project.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateProjectForm) => {
    createProjectMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your project..." 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={createProjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}