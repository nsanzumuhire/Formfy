import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertProjectSchema, createProjectSchema, insertApiKeySchema, insertFormSchema, insertSubmissionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns the project
      if (project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = createProjectSchema.parse(req.body);
      const projectData = { ...validatedData, userId };
      const project = await storage.createProject(projectData);

      // Automatically create testing and production API keys
      await storage.createApiKey({
        projectId: project.id,
        name: "Testing Key",
        environment: "testing",
        permissions: ["forms:read", "forms:write", "submissions:read", "submissions:write"],
      });

      await storage.createApiKey({
        projectId: project.id,
        name: "Production Key", 
        environment: "production",
        permissions: ["forms:read", "forms:write", "submissions:read", "submissions:write"],
      });

      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const projectData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, projectData);
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // API Key routes
  app.get('/api/projects/:projectId/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(projectId);

      if (!project || project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const apiKeys = await storage.getProjectApiKeys(projectId);
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post('/api/projects/:projectId/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(projectId);

      if (!project || project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const apiKeyData = insertApiKeySchema.parse({ ...req.body, projectId });
      const apiKey = await storage.createApiKey(apiKeyData);
      res.status(201).json(apiKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid API key data", errors: error.errors });
      }
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  app.delete('/api/api-keys/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      // TODO: Add ownership check through project
      await storage.deleteApiKey(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });

  // Form routes
  app.get('/api/projects/:projectId/forms', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(projectId);

      if (!project || project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const forms = await storage.getProjectForms(projectId);
      res.json(forms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      res.status(500).json({ message: "Failed to fetch forms" });
    }
  });

  app.get('/api/forms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const form = await storage.getForm(id);

      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      // Check ownership through project
      const project = await storage.getProject(form.projectId);
      if (!project || project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(form);
    } catch (error) {
      console.error("Error fetching form:", error);
      res.status(500).json({ message: "Failed to fetch form" });
    }
  });

  app.post('/api/projects/:projectId/forms', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(projectId);

      if (!project || project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const formData = insertFormSchema.parse({ ...req.body, projectId });
      const form = await storage.createForm(formData);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      console.error("Error creating form:", error);
      res.status(500).json({ message: "Failed to create form" });
    }
  });

  app.put('/api/forms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const form = await storage.getForm(id);

      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      // Check ownership through project
      const project = await storage.getProject(form.projectId);
      if (!project || project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const formData = insertFormSchema.partial().parse(req.body);
      const updatedForm = await storage.updateForm(id, formData);
      res.json(updatedForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      console.error("Error updating form:", error);
      res.status(500).json({ message: "Failed to update form" });
    }
  });

  app.delete('/api/forms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const form = await storage.getForm(id);

      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      // Check ownership through project
      const project = await storage.getProject(form.projectId);
      if (!project || project.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteForm(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting form:", error);
      res.status(500).json({ message: "Failed to delete form" });
    }
  });

  // Public form access endpoint (no auth required)
  app.get('/api/forms/:projectId/:formName', async (req, res) => {
    try {
      const { projectId, formName } = req.params;
      const form = await storage.getFormByName(projectId, formName);

      if (!form || !form.isActive) {
        return res.status(404).json({ message: "Form not found or inactive" });
      }

      // Return form schema without sensitive data
      res.json({
        id: form.id,
        name: form.name,
        description: form.description,
        schema: form.schema,
        projectId: form.projectId,
      });
    } catch (error) {
      console.error("Error fetching public form:", error);
      res.status(500).json({ message: "Failed to fetch form" });
    }
  });

  // Public form submission endpoint (no auth required)
  app.post('/api/forms/:projectId/:formName/submit', async (req, res) => {
    try {
      const { projectId, formName } = req.params;
      const form = await storage.getFormByName(projectId, formName);

      if (!form || !form.isActive) {
        return res.status(404).json({ message: "Form not found or inactive" });
      }

      const submissionData = insertSubmissionSchema.parse({
        formId: form.id,
        data: req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const submission = await storage.createSubmission(submissionData);
      res.status(201).json({ message: "Form submitted successfully", id: submission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      console.error("Error submitting form:", error);
      res.status(500).json({ message: "Failed to submit form" });
    }
  });

  // Form schema endpoint for SDK (requires API key)
  app.get('/api/forms/:projectId/:formName/schema', async (req, res) => {
    try {
      const { projectId, formName } = req.params;
      const apiKey = req.headers['x-api-key'] as string;

      if (!apiKey) {
        return res.status(401).json({ message: "API key required" });
      }

      const keyRecord = await storage.getApiKey(apiKey);
      if (!keyRecord || !keyRecord.isActive || keyRecord.projectId !== projectId) {
        return res.status(403).json({ message: "Invalid API key" });
      }

      const form = await storage.getFormByName(projectId, formName);
      if (!form || !form.isActive) {
        return res.status(404).json({ message: "Form not found or inactive" });
      }

      res.json({ schema: form.schema });
    } catch (error) {
      console.error("Error fetching form schema:", error);
      res.status(500).json({ message: "Failed to fetch form schema" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projects = await storage.getUserProjects(userId);

      let totalForms = 0;
      let totalSubmissions = 0;

      for (const project of projects) {
        const forms = await storage.getProjectForms(project.id);
        totalForms += forms.length;

        for (const form of forms) {
          const submissions = await storage.getFormSubmissions(form.id);
          totalSubmissions += submissions.length;
        }
      }

      res.json({
        totalProjects: projects.length,
        totalForms,
        totalSubmissions,
        apiCalls: 0, // TODO: Implement API call tracking
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
