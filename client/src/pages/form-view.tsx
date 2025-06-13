import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { FormFieldData, FormSchema } from "@/lib/form-builder";

interface PublicForm {
  id: string;
  name: string;
  description?: string;
  schema: FormSchema;
  projectId: string;
}

export default function FormView() {
  const [, params] = useRoute("/form/:projectId/:formName");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: form, isLoading, error } = useQuery<PublicForm>({
    queryKey: [`/api/forms/${params?.projectId}/${params?.formName}`],
    enabled: !!(params?.projectId && params?.formName),
  });

  const submitMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetch(`/api/forms/${params?.projectId}/${params?.formName}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit form");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Form submitted",
        description: "Thank you for your submission!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit form",
        variant: "destructive",
      });
    },
  });

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const renderField = (field: FormFieldData) => {
    const value = formData[field.id] || "";
    const showLabels = form?.schema?.settings?.showLabels !== false;

    switch (field.type) {
      case "text":
      case "email":
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && <Label htmlFor={field.id}>{field.label}</Label>}
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.validation?.some(rule => rule.type === "required")}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && <Label htmlFor={field.id}>{field.label}</Label>}
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || "")}
              required={field.validation?.some(rule => rule.type === "required")}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={value || false}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              />
              <Label htmlFor={field.id}>{field.label}</Label>
            </div>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && <Label>{field.label}</Label>}
            <RadioGroup
              value={value}
              onValueChange={(value) => handleFieldChange(field.id, value)}
              required={field.validation?.some(rule => rule.type === "required")}
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${index}`} />
                  <Label htmlFor={`${field.id}-${index}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && <Label htmlFor={field.id}>{field.label}</Label>}
            <Select
              value={value}
              onValueChange={(value) => handleFieldChange(field.id, value)}
              required={field.validation?.some(rule => rule.type === "required")}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!params?.projectId || !params?.formName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Form URL</CardTitle>
            <CardDescription>The form URL is not valid.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Form Not Found</CardTitle>
            <CardDescription>
              The form you're looking for doesn't exist or is not active.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              Your form submission has been received successfully.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const settings = form.schema?.settings || {};
  const buttonLayout = settings.buttonLayout || "right";
  const showCancelButton = settings.showCancelButton || false;

  const getButtonLayoutClass = () => {
    switch (buttonLayout) {
      case "left":
        return "justify-start";
      case "center":
        return "justify-center";
      case "right":
        return "justify-end";
      case "justify":
        return "justify-between";
      case "split":
        return "justify-between";
      default:
        return "justify-end";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
            {form.description && (
              <CardDescription>{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.schema?.fields
                ?.sort((a, b) => a.order - b.order)
                .map((field) => renderField(field))}

              <div className={`flex gap-4 ${getButtonLayoutClass()}`}>
                {showCancelButton && buttonLayout === "split" && (
                  <Button type="button" variant="outline">
                    {settings.cancelButtonText || "Cancel"}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  style={{
                    backgroundColor: settings.submitButtonColor || undefined,
                  }}
                >
                  {submitMutation.isPending
                    ? "Submitting..."
                    : settings.submitButtonText || "Submit"}
                </Button>
                {showCancelButton && buttonLayout !== "split" && (
                  <Button type="button" variant="outline">
                    {settings.cancelButtonText || "Cancel"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}