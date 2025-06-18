import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, inArray } from 'drizzle-orm';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

// Real users from your database
const realUsers = [
  {
    id: "39357058",
    email: "nsanzudaniel59@gmail.com",
    firstName: "Nsanzumuhire",
    lastName: "Daniel",
    profileImageUrl: null,
    createdAt: new Date("2025-06-12T08:20:57.052Z"),
    updatedAt: new Date("2025-06-13T13:55:18.116Z")
  },
  {
    id: "43154697",
    email: "flexkairo@gmail.com",
    firstName: "flex",
    lastName: "kairo",
    profileImageUrl: null,
    createdAt: new Date("2025-06-13T13:27:21.241Z"),
    updatedAt: new Date("2025-06-13T13:27:21.241Z")
  }
];

// Real projects from your database
const realProjects = [
  {
    id: "459dcc81-1cbc-4d57-9f6f-65b0211ad859",
    name: "Formix",
    description: "Formidable project",
    projectId: "proj_9q3x8bk9mx0z",
    projectKey: "pk_live_5a1de3ae73afcd19a68f02797904dcaeea7789a3b8485b38",
    userId: "39357058",
    createdAt: new Date("2025-06-12T09:20:21.680Z"),
    updatedAt: new Date("2025-06-12T09:20:21.680Z")
  },
  {
    id: "c0032a21-9596-4f03-b1a0-2caddcbda7ee",
    name: "Test project",
    description: "Test project description",
    projectId: "proj_dimqg7btz26d",
    projectKey: "pk_live_53aed89f1462047847ef9126de8c3d85b80ce568619b3e9b",
    userId: "39357058",
    createdAt: new Date("2025-06-12T09:20:55.619Z"),
    updatedAt: new Date("2025-06-12T09:20:55.619Z")
  }
];

// Real forms from your database with actual schemas
const realForms = [
  {
    id: "822e9c62-e136-4f4b-a530-c31b0ebd24f7",
    name: "auto drag",
    projectId: "c0032a21-9596-4f03-b1a0-2caddcbda7ee",
    description: "auto drag des",
    schema: {
      fields: [
        {
          id: "1750251624183",
          type: "email",
          label: "Email Address",
          order: 0,
          rowId: "row_1750251624183_9qx7ail0w",
          width: 100,
          layout: "vertical",
          required: true,
          placeholder: "Enter your email..."
        },
        {
          id: "1750251625805",
          type: "text",
          label: "Text Field",
          order: 1,
          rowId: "row_1750251643509_fe9lx3ats",
          width: 50,
          layout: "vertical",
          placeholder: "Enter text here..."
        },
        {
          id: "1750251642173",
          name: "option1",
          type: "select",
          label: "Select Option 1",
          order: 2,
          rowId: "row_1750251643509_fe9lx3ats",
          width: 50,
          layout: "vertical",
          options: [
            { label: "Option 1", value: "option-1" },
            { label: "Option 2", value: "option-2" }
          ],
          required: true,
          placeholder: "Choose an option..."
        },
        {
          id: "1750251691313",
          type: "textarea",
          label: "Textarea",
          order: 3,
          rowId: "row_1750251691313_9ri4ccmio",
          width: 100,
          layout: "vertical",
          condition: {
            rules: [
              {
                field: "option1",
                value: "option-1",
                operator: "=="
              }
            ]
          },
          placeholder: "Enter your message..."
        }
      ],
      settings: {
        title: "auto drag",
        layout: "auto",
        spacing: "12px",
        showLabels: true,
        description: "auto drag des",
        gridColumns: 2,
        buttonLayout: "right",
        customSpacing: 24,
        cancelButtonText: "Cancel",
        showCancelButton: true,
        submitButtonText: "Submit",
        cancelButtonColor: "#6b7280",
        submitButtonColor: "#3bf773"
      }
    },
    isActive: true,
    createdAt: new Date("2025-06-18T11:05:08.541Z"),
    updatedAt: new Date("2025-06-18T11:36:44.749Z")
  },
  {
    id: "b4ef37ef-e8a6-4e50-a6ed-ef32fab18b4b",
    name: "val edition",
    projectId: "c0032a21-9596-4f03-b1a0-2caddcbda7ee",
    description: null,
    schema: {
      fields: [
        {
          id: "1750254071312",
          type: "text",
          label: "Text Field",
          order: 0,
          rowId: "row_1750254086624_ufytxcyer",
          width: 50,
          layout: "vertical",
          placeholder: "Enter text here..."
        },
        {
          id: "1750254109749",
          type: "select",
          label: "Select Option",
          order: 1,
          rowId: "row_1750254086624_ufytxcyer",
          width: 50,
          layout: "vertical",
          options: [
            { label: "Option 1", value: "option-1" },
            { label: "Option 2", value: "option-2" }
          ],
          placeholder: "Choose an option..."
        },
        {
          id: "1750254119081",
          type: "text",
          label: "Text Field",
          order: 2,
          rowId: "row_1750254119081_9jy0scvzx",
          width: 100,
          layout: "vertical",
          condition: {
            type: "visibility",
            rules: [
              {
                value: "option-2",
                operator: "=="
              }
            ]
          },
          placeholder: "Enter text here..."
        }
      ],
      settings: {
        title: "val edition",
        layout: "auto",
        spacing: "8px",
        showLabels: true,
        gridColumns: 2,
        buttonLayout: "right",
        customSpacing: 8,
        cancelButtonText: "Cancel",
        showCancelButton: false,
        submitButtonText: "Submit",
        cancelButtonColor: "#6b7280",
        submitButtonColor: "#3b82f6"
      }
    },
    isActive: true,
    createdAt: new Date("2025-06-18T11:42:59.024Z"),
    updatedAt: new Date("2025-06-18T11:42:59.024Z")
  },
  {
    id: "ff46fb7e-dbd0-4d51-ad83-e7271d56c3b1",
    name: "registration v1",
    projectId: "c0032a21-9596-4f03-b1a0-2caddcbda7ee",
    description: "registration v1 description",
    schema: {
      fields: [
        {
          id: "1749815330125",
          name: "firstName",
          type: "text",
          label: "First name",
          order: 0,
          width: "100%",
          layout: "vertical",
          required: true,
          placeholder: "Enter first name",
          validation: {
            errorMessages: {
              required: "first name is required"
            }
          }
        },
        {
          id: "1749815330555",
          name: "Email Adress",
          type: "email",
          label: "Email",
          order: 1,
          width: "100%",
          layout: "vertical",
          required: true,
          placeholder: "Enter email address..."
        },
        {
          id: "1749815330964",
          name: "phonr",
          type: "number",
          label: "Phone Number",
          order: 2,
          width: "100%",
          layout: "vertical",
          required: true,
          placeholder: "Enter number..."
        },
        {
          id: "1749815332345",
          name: "driverLisence",
          type: "checkbox",
          label: "Has driver license",
          order: 3,
          width: "100%",
          layout: "vertical",
          required: true,
          placeholder: "Yes"
        },
        {
          id: "1749815522309",
          name: "gender",
          type: "select",
          label: "Gender",
          order: 4,
          width: "100%",
          layout: "vertical",
          required: true,
          options: [
            { label: "Male", value: "MALE" },
            { label: "Female", value: "FEMALE" }
          ],
          placeholder: "Choose gender"
        },
        {
          id: "1749815614776",
          name: "race",
          type: "select",
          label: "Race",
          order: 5,
          width: "100%",
          layout: "vertical",
          required: false,
          options: [
            { label: "Black", value: "BLACK" },
            { label: "White", value: "WHITE" }
          ],
          condition: {
            type: "visibility",
            logic: "AND",
            rules: [
              {
                field: "gender",
                value: "MALE",
                operator: "=="
              }
            ]
          },
          placeholder: "Choose race"
        }
      ],
      settings: {
        title: "registration v1",
        layout: "two-column",
        spacing: "custom",
        showLabels: true,
        description: "registration v1 description",
        gridColumns: 2,
        buttonLayout: "right",
        customSpacing: 12,
        cancelButtonText: "Cancel",
        showCancelButton: true,
        submitButtonText: "Submit",
        cancelButtonColor: "#6b7280",
        submitButtonColor: "#3b82f6"
      }
    },
    isActive: true,
    createdAt: new Date("2025-06-13T09:56:21.914Z"),
    updatedAt: new Date("2025-06-13T09:56:21.914Z")
  },
  {
    id: "e1ef7687-3e08-442d-b884-f934aac123ba",
    name: "form 1",
    projectId: "c0032a21-9596-4f03-b1a0-2caddcbda7ee",
    description: "werwer",
    schema: {
      fields: [
        {
          id: "1749814912790",
          name: "field_1749814912790",
          type: "text",
          label: "Text Input",
          order: 0,
          width: "100%",
          layout: "vertical",
          required: false,
          placeholder: "Enter text..."
        },
        {
          id: "1749814914273",
          name: "field_1749814914273",
          type: "email",
          label: "Email",
          order: 1,
          width: "100%",
          layout: "vertical",
          required: false,
          placeholder: "Enter email address..."
        },
        {
          id: "1749814915817",
          name: "field_1749814915817",
          type: "select",
          label: "Dropdown",
          order: 2,
          width: "100%",
          layout: "vertical",
          required: false,
          options: [],
          placeholder: "Choose an option"
        },
        {
          id: "1749818963046",
          name: "field_1749818963046",
          type: "email",
          label: "Email",
          order: 3,
          width: "100%",
          layout: "vertical",
          required: false,
          placeholder: "Enter email address..."
        },
        {
          id: "1749818965754",
          name: "field_1749818965754",
          type: "radio",
          label: "Radio Button",
          order: 4,
          width: "100%",
          layout: "vertical",
          required: false,
          options: [],
          placeholder: "Select option"
        },
        {
          id: "1749818966439",
          name: "field_1749818966439",
          type: "select",
          label: "Dropdown",
          order: 5,
          width: "100%",
          layout: "vertical",
          required: false,
          options: [],
          placeholder: "Choose an option"
        }
      ],
      settings: {
        title: "form 1",
        layout: "single",
        spacing: "8px",
        showLabels: true,
        description: "werwer",
        gridColumns: 2,
        buttonLayout: "right",
        customSpacing: 8,
        cancelButtonText: "Cancel",
        showCancelButton: false,
        submitButtonText: "Submit",
        cancelButtonColor: "#6b7280",
        submitButtonColor: "#3b82f6"
      }
    },
    isActive: true,
    createdAt: new Date("2025-06-13T09:42:05.878Z"),
    updatedAt: new Date("2025-06-13T10:49:34.003Z")
  }
];

// Sample API keys for the real projects
const realApiKeys = [
  {
    name: "Production Key",
    key: "pk_live_5a1de3ae73afcd19a68f02797904dcaeea7789a3b8485b38",
    projectId: "459dcc81-1cbc-4d57-9f6f-65b0211ad859",
    environment: "production" as const,
    isActive: true
  },
  {
    name: "Development Key", 
    key: "pk_test_459dcc81_dev_key_12345",
    projectId: "459dcc81-1cbc-4d57-9f6f-65b0211ad859",
    environment: "development" as const,
    isActive: true
  },
  {
    name: "Production Key",
    key: "pk_live_53aed89f1462047847ef9126de8c3d85b80ce568619b3e9b",
    projectId: "c0032a21-9596-4f03-b1a0-2caddcbda7ee",
    environment: "production" as const,
    isActive: true
  },
  {
    name: "Development Key",
    key: "pk_test_c0032a21_dev_key_67890",
    projectId: "c0032a21-9596-4f03-b1a0-2caddcbda7ee",
    environment: "development" as const,
    isActive: true
  }
];

// Sample form submissions using realistic data
const realSubmissions = [
  {
    formId: "822e9c62-e136-4f4b-a530-c31b0ebd24f7", // auto drag form
    data: {
      "1750251624183": "nsanzu@example.com",
      "1750251625805": "Daniel Nsanzumuhire",
      "1750251642173": "option-1",
      "1750251691313": "This is a test message for the conditional textarea field."
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: new Date("2025-06-18T14:30:00.000Z")
  },
  {
    formId: "ff46fb7e-dbd0-4d51-ad83-e7271d56c3b1", // registration v1
    data: {
      firstName: "Daniel",
      "Email Adress": "daniel@example.com",
      phonr: "1234567890",
      driverLisence: true,
      gender: "MALE",
      race: "BLACK"
    },
    ipAddress: "10.0.0.50",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    createdAt: new Date("2025-06-18T15:15:00.000Z")
  },
  {
    formId: "b4ef37ef-e8a6-4e50-a6ed-ef32fab18b4b", // val edition
    data: {
      "1750254071312": "Test input",
      "1750254109749": "option-2",
      "1750254119081": "Conditional field visible because option-2 was selected"
    },
    ipAddress: "172.16.0.10",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    createdAt: new Date("2025-06-18T16:00:00.000Z")
  }
];

async function seedRealData() {
  console.log("Seeding database with real data from your environment...");

  try {
    // Clear existing test data first
    console.log("Clearing existing test data...");
    await db.delete(schema.submissions);
    await db.delete(schema.forms);
    await db.delete(schema.apiKeys);
    await db.delete(schema.projects);
    // Clear specific test users
    await db.delete(schema.users).where(inArray(schema.users.id, ["39357058", "43154697"]));

    // Insert real users
    console.log("Inserting real users...");
    for (const user of realUsers) {
      await db.insert(schema.users).values(user).onConflictDoNothing();
    }

    // Insert real projects
    console.log("Inserting real projects...");
    for (const project of realProjects) {
      await db.insert(schema.projects).values(project).onConflictDoNothing();
    }

    // Insert API keys
    console.log("Inserting API keys...");
    for (const apiKey of realApiKeys) {
      await db.insert(schema.apiKeys).values(apiKey).onConflictDoNothing();
    }

    // Insert real forms
    console.log("Inserting real forms...");
    for (const form of realForms) {
      await db.insert(schema.forms).values(form).onConflictDoNothing();
    }

    // Insert sample submissions
    console.log("Inserting sample submissions...");
    for (const submission of realSubmissions) {
      await db.insert(schema.submissions).values(submission).onConflictDoNothing();
    }

    console.log("Database seeded successfully with real data!");
    console.log(`Created:
    - ${realUsers.length} users
    - ${realProjects.length} projects  
    - ${realApiKeys.length} API keys
    - ${realForms.length} forms
    - ${realSubmissions.length} form submissions`);

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedRealData().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});