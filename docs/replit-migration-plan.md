# 🛠️ Replit Dependency Migration Plan

This document outlines the comprehensive plan to remove all Replit dependencies from the Formfy project and make it fully self-contained and production-ready.

## 📋 Current Replit Dependencies

### Authentication
- **Replit Auth**: Currently using Replit's OpenID Connect for authentication
- **Environment Variables**: `REPLIT_DOMAINS`, `REPL_ID`, `ISSUER_URL`
- **Session Management**: Using PostgreSQL session store tied to Replit auth

### Build & Development
- **Vite Plugins**:
  - `@replit/vite-plugin-cartographer`
  - `@replit/vite-plugin-runtime-error-modal`
- **Configuration**: `.replit` file with Replit-specific settings

## 🎯 Migration Objectives

1. Replace Replit Auth with standard OAuth providers
2. Remove all Replit-specific code and dependencies
3. Create environment-agnostic configuration
4. Ensure the application runs independently in any environment

## 📝 Detailed Migration Plan

### 1. 🔐 Authentication System Migration

#### 1.1 OAuth Provider Integration

- **Implement OAuth with Google**:
  - Register application in Google Developer Console
  - Obtain Client ID and Client Secret
  - Implement OAuth 2.0 flow with PKCE for added security

- **Implement OAuth with GitHub**:
  - Register application in GitHub Developer Settings
  - Obtain Client ID and Client Secret
  - Implement OAuth flow

#### 1.2 Authentication Backend

- **Replace `replitAuth.ts` with new auth module**:
  - Create `auth/index.ts` to manage all auth providers
  - Implement provider-agnostic user session management
  - Update database schema for multi-provider authentication

#### 1.3 Session Management

- **Update session configuration**:
  - Maintain PostgreSQL session store but remove Replit-specific code
  - Implement secure cookie management
  - Add CSRF protection

#### 1.4 User Profile Management

- **Standardize user profile data**:
  - Create unified user profile structure across providers
  - Implement profile data mapping from different providers
  - Add user profile management UI

### 2. 🧹 Codebase Cleanup

#### 2.1 Remove Replit-specific Dependencies

- **Remove packages**:
  ```bash
  npm uninstall @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal
  ```

- **Update Vite configuration**:
  - Remove Replit plugin imports and usage
  - Replace with standard Vite plugins if needed

#### 2.2 Environment Configuration

- **Create comprehensive `.env` structure**:
  ```
  # Database
  DATABASE_URL=postgresql://user:password@localhost:5432/formfy
  
  # Auth - Google
  GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  
  # Auth - GitHub
  GITHUB_CLIENT_ID=your_github_client_id
  GITHUB_CLIENT_SECRET=your_github_client_secret
  
  # Session
  SESSION_SECRET=your_secure_session_secret
  
  # App
  NODE_ENV=development
  PORT=5000
  ```

- **Update configuration loading**:
  - Ensure dotenv is properly configured
  - Add validation for required environment variables

#### 2.3 Code Refactoring

- **Update server/routes.ts**:
  - Replace `setupAuth` and `isAuthenticated` imports from replitAuth
  - Implement new auth middleware

- **Update server/index.ts**:
  - Remove any Replit-specific code
  - Update server configuration

### 3. 🖥️ Environment Setup & Deployment

#### 3.1 Local Development Environment

- **Create development setup documentation**:
  - Database setup instructions
  - Environment variable configuration
  - Local development workflow

#### 3.2 Production Deployment

- **Create deployment documentation**:
  - Environment requirements
  - Database setup
  - Environment variable configuration
  - Deployment process

#### 3.3 CI/CD Integration

- **Setup GitHub Actions workflow**:
  - Automated testing
  - Build process
  - Deployment to production

## 📅 Implementation Timeline

1. **Week 1**: Authentication System Migration
   - Set up OAuth providers
   - Create new auth module
   - Update session management

2. **Week 2**: Codebase Cleanup
   - Remove Replit dependencies
   - Update environment configuration
   - Refactor affected code

3. **Week 3**: Testing & Documentation
   - Test all functionality
   - Create documentation
   - Finalize deployment process

## 🧪 Testing Strategy

1. **Unit Tests**:
   - Test individual auth functions
   - Validate environment configuration

2. **Integration Tests**:
   - Test complete auth flows
   - Verify database interactions

3. **End-to-End Tests**:
   - Test user journeys
   - Verify application functionality

## 📚 Resources & References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Express.js Authentication Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Passport.js Documentation](https://www.passportjs.org/docs/)

## 🚀 Next Steps

1. Set up OAuth application registrations with Google and GitHub
2. Create new auth module structure
3. Begin implementing OAuth flows 