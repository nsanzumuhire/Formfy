import {
  users,
  projects,
  apiKeys,
  forms,
  submissions,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type ApiKey,
  type InsertApiKey,
  type Form,
  type InsertForm,
  type Submission,
  type InsertSubmission,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // API Key operations
  getProjectApiKeys(projectId: string): Promise<ApiKey[]>;
  getApiKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: string, apiKey: Partial<InsertApiKey>): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;
  
  // Form operations
  getProjectForms(projectId: string): Promise<Form[]>;
  getForm(id: string): Promise<Form | undefined>;
  getFormByName(projectId: string, name: string): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, form: Partial<InsertForm>): Promise<Form>;
  deleteForm(id: string): Promise<void>;
  
  // Submission operations
  getFormSubmissions(formId: string): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const projectId = this.generateProjectId();
    const projectKey = this.generateProjectKey();
    
    const [newProject] = await db.insert(projects).values({
      ...project,
      projectId,
      projectKey,
    }).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // API Key operations
  async getProjectApiKeys(projectId: string): Promise<ApiKey[]> {
    return await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.projectId, projectId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey;
  }

  async createApiKey(apiKeyData: InsertApiKey): Promise<ApiKey> {
    const key = this.generateApiKey();
    const [apiKey] = await db
      .insert(apiKeys)
      .values({ ...apiKeyData, key })
      .returning();
    return apiKey;
  }

  async updateApiKey(id: string, apiKeyData: Partial<InsertApiKey>): Promise<ApiKey> {
    const [updatedApiKey] = await db
      .update(apiKeys)
      .set({ ...apiKeyData, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return updatedApiKey;
  }

  async deleteApiKey(id: string): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  // Form operations
  async getProjectForms(projectId: string): Promise<Form[]> {
    return await db
      .select()
      .from(forms)
      .where(eq(forms.projectId, projectId))
      .orderBy(desc(forms.updatedAt));
  }

  async getForm(id: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async getFormByName(projectId: string, name: string): Promise<Form | undefined> {
    const [form] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.projectId, projectId), eq(forms.name, name)));
    return form;
  }

  async createForm(form: InsertForm): Promise<Form> {
    const [newForm] = await db.insert(forms).values(form).returning();
    return newForm;
  }

  async updateForm(id: string, form: Partial<InsertForm>): Promise<Form> {
    const [updatedForm] = await db
      .update(forms)
      .set({ ...form, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return updatedForm;
  }

  async deleteForm(id: string): Promise<void> {
    await db.delete(forms).where(eq(forms.id, id));
  }

  // Submission operations
  async getFormSubmissions(formId: string): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.formId, formId))
      .orderBy(desc(submissions.createdAt));
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db.insert(submissions).values(submission).returning();
    return newSubmission;
  }

  // Helper methods
  private generateApiKey(): string {
    return `fk_${randomBytes(32).toString('hex')}`;
  }

  public generateProjectId(): string {
    // Generate a readable project ID like "proj_abc123def456"
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'proj_';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public generateProjectKey(): string {
    // Generate a secure project key like "pk_live_abc123..."
    return `pk_live_${randomBytes(24).toString('hex')}`;
  }
}

export const storage = new DatabaseStorage();
