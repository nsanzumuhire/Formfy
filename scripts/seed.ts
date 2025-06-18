import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import { nanoid } from 'nanoid';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

// Sample form schemas
const contactFormSchema = {
  fields: [
    {
      id: "field_1",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      order: 0
    },
    {
      id: "field_2",
      type: "email",
      label: "Email Address",
      placeholder: "your@email.com",
      required: true,
      order: 1
    },
    {
      id: "field_3",
      type: "tel",
      label: "Phone Number",
      placeholder: "(555) 123-4567",
      required: false,
      order: 2
    },
    {
      id: "field_4",
      type: "select",
      label: "How did you hear about us?",
      placeholder: "Select an option",
      required: false,
      order: 3,
      options: [
        { label: "Search Engine", value: "search" },
        { label: "Social Media", value: "social" },
        { label: "Friend Referral", value: "referral" },
        { label: "Advertisement", value: "ad" }
      ]
    },
    {
      id: "field_5",
      type: "textarea",
      label: "Message",
      placeholder: "Tell us how we can help you...",
      required: true,
      order: 4
    }
  ],
  settings: {
    title: "Contact Us",
    description: "Get in touch with our team",
    showLabels: true,
    buttonLayout: "right",
    submitButtonText: "Send Message",
    cancelButtonText: "Cancel",
    submitButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    showCancelButton: false
  }
};

const feedbackFormSchema = {
  fields: [
    {
      id: "field_1",
      type: "text",
      label: "Your Name",
      placeholder: "Enter your name",
      required: true,
      order: 0
    },
    {
      id: "field_2",
      type: "radio",
      label: "Overall Satisfaction",
      required: true,
      order: 1,
      options: [
        { label: "Very Satisfied", value: "very_satisfied" },
        { label: "Satisfied", value: "satisfied" },
        { label: "Neutral", value: "neutral" },
        { label: "Dissatisfied", value: "dissatisfied" },
        { label: "Very Dissatisfied", value: "very_dissatisfied" }
      ]
    },
    {
      id: "field_3",
      type: "checkbox",
      label: "Features Used",
      required: false,
      order: 2,
      options: [
        { label: "Form Builder", value: "form_builder" },
        { label: "API Integration", value: "api" },
        { label: "Analytics", value: "analytics" },
        { label: "Custom Themes", value: "themes" }
      ]
    },
    {
      id: "field_4",
      type: "number",
      label: "Rate us (1-10)",
      placeholder: "10",
      required: false,
      order: 3
    },
    {
      id: "field_5",
      type: "textarea",
      label: "Additional Comments",
      placeholder: "Share your thoughts...",
      required: false,
      order: 4
    }
  ],
  settings: {
    title: "Feedback Survey",
    description: "Help us improve our service",
    showLabels: true,
    buttonLayout: "center",
    submitButtonText: "Submit Feedback",
    cancelButtonText: "Cancel",
    submitButtonColor: "#10b981",
    cancelButtonColor: "#6b7280",
    showCancelButton: true
  }
};

const eventRegistrationSchema = {
  fields: [
    {
      id: "field_1",
      type: "text",
      label: "First Name",
      placeholder: "John",
      required: true,
      order: 0
    },
    {
      id: "field_2",
      type: "text",
      label: "Last Name",
      placeholder: "Doe",
      required: true,
      order: 1
    },
    {
      id: "field_3",
      type: "email",
      label: "Email",
      placeholder: "john@example.com",
      required: true,
      order: 2
    },
    {
      id: "field_4",
      type: "tel",
      label: "Phone",
      placeholder: "+1 (555) 123-4567",
      required: true,
      order: 3
    },
    {
      id: "field_5",
      type: "select",
      label: "Ticket Type",
      placeholder: "Select ticket type",
      required: true,
      order: 4,
      options: [
        { label: "General Admission - $50", value: "general" },
        { label: "VIP - $150", value: "vip" },
        { label: "Student - $25", value: "student" }
      ]
    },
    {
      id: "field_6",
      type: "checkbox",
      label: "Dietary Restrictions",
      required: false,
      order: 5,
      options: [
        { label: "Vegetarian", value: "vegetarian" },
        { label: "Vegan", value: "vegan" },
        { label: "Gluten Free", value: "gluten_free" },
        { label: "Nut Allergy", value: "nut_allergy" }
      ]
    },
    {
      id: "field_7",
      type: "date",
      label: "Date of Birth",
      required: false,
      order: 6
    }
  ],
  settings: {
    title: "Event Registration",
    description: "Register for our upcoming conference",
    showLabels: true,
    buttonLayout: "right",
    submitButtonText: "Register Now",
    cancelButtonText: "Cancel",
    submitButtonColor: "#8b5cf6",
    cancelButtonColor: "#6b7280",
    showCancelButton: false
  }
};

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create sample users
    const sampleUsers = [
      {
        id: "user_1",
        email: "demo@formfy.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "user_2", 
        email: "sarah@company.com",
        firstName: "Sarah",
        lastName: "Johnson",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b332e2c0?w=150&h=150&fit=crop&crop=face"
      }
    ];

    console.log("👥 Creating sample users...");
    for (const user of sampleUsers) {
      await db.insert(schema.users).values(user).onConflictDoNothing();
    }

    // Create sample projects
    const sampleProjects = [
      {
        name: "Marketing Website",
        description: "Forms for our marketing website and landing pages",
        projectId: "mkt_" + nanoid(8),
        projectKey: "mk_" + nanoid(16),
        userId: "user_1"
      },
      {
        name: "Customer Support",
        description: "Support tickets and feedback collection",
        projectId: "sup_" + nanoid(8),
        projectKey: "sp_" + nanoid(16),
        userId: "user_1"
      },
      {
        name: "Event Management",
        description: "Event registration and management forms",
        projectId: "evt_" + nanoid(8),
        projectKey: "ev_" + nanoid(16),
        userId: "user_2"
      }
    ];

    console.log("📁 Creating sample projects...");
    const createdProjects = [];
    for (const project of sampleProjects) {
      const [created] = await db.insert(schema.projects).values(project).returning();
      createdProjects.push(created);
    }

    // Create API keys for projects
    console.log("🔑 Creating API keys...");
    for (const project of createdProjects) {
      await db.insert(schema.apiKeys).values([
        {
          name: "Production Key",
          key: "pk_live_" + nanoid(32),
          projectId: project.id,
          isActive: true
        },
        {
          name: "Development Key", 
          key: "pk_test_" + nanoid(32),
          projectId: project.id,
          isActive: true
        }
      ]);
    }

    // Create sample forms
    console.log("📝 Creating sample forms...");
    const sampleForms = [
      {
        name: "Contact Form",
        description: "Main contact form for the website",
        projectId: createdProjects[0].id,
        schema: contactFormSchema,
        isActive: true
      },
      {
        name: "Newsletter Signup",
        description: "Simple email collection form",
        projectId: createdProjects[0].id,
        schema: {
          fields: [
            {
              id: "field_1",
              type: "email",
              label: "Email Address",
              placeholder: "Enter your email",
              required: true,
              order: 0
            }
          ],
          settings: {
            title: "Newsletter Signup",
            description: "Stay updated with our latest news",
            showLabels: false,
            buttonLayout: "right",
            submitButtonText: "Subscribe",
            submitButtonColor: "#3b82f6"
          }
        },
        isActive: true
      },
      {
        name: "Customer Feedback",
        description: "Collect customer feedback and ratings",
        projectId: createdProjects[1].id,
        schema: feedbackFormSchema,
        isActive: true
      },
      {
        name: "Bug Report",
        description: "Technical issue reporting form",
        projectId: createdProjects[1].id,
        schema: {
          fields: [
            {
              id: "field_1",
              type: "text",
              label: "Issue Title",
              placeholder: "Brief description of the issue",
              required: true,
              order: 0
            },
            {
              id: "field_2",
              type: "select",
              label: "Priority",
              placeholder: "Select priority level",
              required: true,
              order: 1,
              options: [
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
                { label: "Critical", value: "critical" }
              ]
            },
            {
              id: "field_3",
              type: "textarea",
              label: "Description",
              placeholder: "Detailed description of the issue...",
              required: true,
              order: 2
            },
            {
              id: "field_4",
              type: "file",
              label: "Screenshots",
              placeholder: "Attach screenshots if applicable",
              required: false,
              order: 3
            }
          ],
          settings: {
            title: "Bug Report",
            description: "Help us fix issues by reporting bugs",
            showLabels: true,
            buttonLayout: "right",
            submitButtonText: "Submit Report",
            submitButtonColor: "#ef4444"
          }
        },
        isActive: true
      },
      {
        name: "Conference Registration",
        description: "Registration form for annual conference",
        projectId: createdProjects[2].id,
        schema: eventRegistrationSchema,
        isActive: true
      }
    ];

    const createdForms = [];
    for (const form of sampleForms) {
      const [created] = await db.insert(schema.forms).values(form).returning();
      createdForms.push(created);
    }

    // Create sample form submissions
    console.log("📊 Creating sample submissions...");
    const sampleSubmissions = [
      {
        formId: createdForms[0].id, // Contact Form
        data: {
          field_1: "John Smith",
          field_2: "john.smith@email.com",
          field_3: "(555) 123-4567",
          field_4: "search",
          field_5: "I'm interested in learning more about your services. Could you please contact me?"
        },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      {
        formId: createdForms[0].id, // Contact Form
        data: {
          field_1: "Emily Johnson",
          field_2: "emily.j@company.com",
          field_3: "(555) 987-6543",
          field_4: "referral",
          field_5: "Looking for a partnership opportunity. Please reach out at your earliest convenience."
        },
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      },
      {
        formId: createdForms[1].id, // Newsletter
        data: {
          field_1: "newsletter@subscriber.com"
        },
        ipAddress: "203.0.113.5",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15"
      },
      {
        formId: createdForms[2].id, // Feedback
        data: {
          field_1: "Alex Chen",
          field_2: "very_satisfied",
          field_3: ["form_builder", "api"],
          field_4: "9",
          field_5: "Great platform! The form builder is intuitive and the API documentation is excellent."
        },
        ipAddress: "172.16.0.10",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
      },
      {
        formId: createdForms[4].id, // Conference Registration
        data: {
          field_1: "Maria",
          field_2: "Garcia",
          field_3: "maria.garcia@startup.com",
          field_4: "+1 (555) 456-7890",
          field_5: "vip",
          field_6: ["vegetarian"],
          field_7: "1990-05-15"
        },
        ipAddress: "198.51.100.25",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    ];

    for (const submission of sampleSubmissions) {
      await db.insert(schema.submissions).values(submission);
    }

    console.log("✅ Database seeding completed successfully!");
    console.log(`📈 Created:
    - ${sampleUsers.length} users
    - ${sampleProjects.length} projects  
    - ${sampleProjects.length * 2} API keys
    - ${sampleForms.length} forms
    - ${sampleSubmissions.length} form submissions`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeder
seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});