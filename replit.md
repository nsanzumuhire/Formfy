# Formfy - Form Builder Platform

## Overview

Formfy is a modern form builder platform that allows users to create, manage, and deploy forms with a drag-and-drop interface. The application is built as a full-stack web application with React/TypeScript frontend and Express backend, designed to run on Replit with PostgreSQL database integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, local React state for UI
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation
- **Drag & Drop**: @dnd-kit for form builder interactions
- **Authentication**: Replit Auth integration

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with REST API design
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: OpenID Connect with Replit as provider

## Key Components

### Database Schema
- **Users**: Stores user profiles with Replit Auth integration
- **Projects**: Project containers for organizing forms
- **Forms**: Form definitions with JSON schema storage
- **API Keys**: Project-scoped API keys for form submissions
- **Submissions**: Form submission data storage
- **Sessions**: Session management for authentication

### Core Features
1. **Project Management**: Multi-project organization with user isolation
2. **Form Builder**: Drag-and-drop interface with visual form creation
3. **Form Editor**: Advanced form editing with conditional logic support
4. **API Integration**: RESTful API for form submissions and management
5. **Authentication**: Secure user authentication via Replit Auth
6. **Real-time Preview**: Live form preview during editing

### Form Builder Components
- **Toolbox**: Available form field types (text, email, select, checkbox, etc.)
- **Canvas**: Visual form building area with drag-and-drop support
- **Properties Panel**: Field configuration and validation settings
- **Preview Mode**: Real-time form preview functionality

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OAuth → Session creation → User profile sync
2. **Project Flow**: User creates projects → Project-scoped API keys generated → Forms associated with projects
3. **Form Building Flow**: Drag fields from toolbox → Configure properties → Save form schema to database
4. **Form Submission Flow**: Public form URL → Form rendering → Submission via API → Data storage
5. **Data Management**: Forms stored as JSON schemas → Submissions linked to forms → Project-level data isolation

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, React DOM
- **Styling**: Tailwind CSS, Radix UI primitives
- **Data Fetching**: TanStack Query
- **Form Handling**: React Hook Form, Hookform Resolvers
- **Drag & Drop**: @dnd-kit suite
- **Utilities**: clsx, class-variance-authority, date-fns

### Backend Dependencies
- **Server**: Express.js, TypeScript
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Authentication**: Passport.js, OpenID Client
- **Session**: Express Session, connect-pg-simple
- **Utilities**: Nanoid, Memoizee

### Development Tools
- **Build**: Vite, ESBuild
- **Database**: Drizzle Kit for migrations
- **TypeScript**: Full type safety across stack
- **Development**: TSX for TypeScript execution

## Deployment Strategy

### Replit Configuration
- **Modules**: Node.js 20, Web server, PostgreSQL 16
- **Build Process**: Vite build for frontend, ESBuild for backend
- **Runtime**: Production server serves static files and API
- **Database**: Neon PostgreSQL with connection pooling
- **Environment**: Development and production configurations

### Build Process
1. Frontend builds to `dist/public` via Vite
2. Backend bundles to `dist/index.js` via ESBuild
3. Static file serving in production mode
4. Database migrations via Drizzle Kit

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OAuth provider URL (defaults to Replit)

## Changelog

```
Changelog:
- July 2, 2025. Comprehensive icon support system implementation and critical bug fixes
  - Added icon property to FormFieldData interface with name, position, size, and SVG content
  - Created IconSelector component with Lucide React icons library and search functionality
  - Integrated icon selector into form editor property panel with position and size controls
  - Added icon rendering support in both edit and preview modes for all layout types
  - Fixed icon size/position changes to reflect immediately without re-selection
  - Icons display properly in auto layout, traditional layouts (single, two-column, grid)
  - SVG content is saved with form data for SDK rendering compatibility
  - CRITICAL FIX: Resolved icon selector showing 0 icons - Lucide React exports are objects with $$typeof (React components), not functions
  - Implemented virtual scrolling for 3,462 Lucide icons with efficient filtering and search
  - Fixed button content overflow in icon selector trigger with proper sizing and truncation
- June 30, 2025. Simplified lazy select data functionality for dynamic dropdown options
  - Changed lazySelectData from object to boolean for simplified interface
  - Added checkbox toggle in property panel to switch between manual options and API loading
  - When enabled: hides manual options interface and uses default API endpoint
  - When disabled: shows manual options with add/remove functionality
  - Implemented /api/lazy-select-data endpoint with sample data (countries, states, categories, departments)
  - Enhanced field name validation with auto-generation for proper form submission
- June 26, 2025. Enhanced form save functionality with complete styling capture
  - Added input field classes, styles, width, height for all field types
  - Added form container styling based on layout configuration
  - Created public SDK API endpoint: /form/:formId/:environment
  - Configured CORS to accept localhost requests for public APIs
  - Forms now save complete styling information for SDK rendering
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```