# Environment Variables Template

This document provides a template for the `.env` file needed for the application after removing Replit dependencies.

## `.env` Template

```env
# Database Configuration
# ---------------------
# Connection string for PostgreSQL database
# Format: postgresql://username:password@hostname:port/database
DATABASE_URL=postgresql://user:password@localhost:5432/formfy

# Authentication - Google OAuth
# ----------------------------
# Credentials from Google Cloud Console (https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Authentication - GitHub OAuth
# ----------------------------
# Credentials from GitHub Developer Settings (https://github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Session Configuration
# --------------------
# Secret used to sign session cookies (generate a random string)
# You can generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your_session_secret_at_least_32_chars_long

# Application Settings
# -------------------
# Environment: development, test, or production
NODE_ENV=development

# Port for the server to listen on
PORT=5000

# Deployment Settings
# ------------------
# Base URL for the application (used for callback URLs)
# In production, this should be your domain
APP_URL=http://localhost:5000
```

## Setting Up Environment Variables

### Development Environment

1. Create a `.env` file in the project root
2. Copy the template above and fill in your values
3. Make sure to add `.env` to your `.gitignore` file

### Production Environment

For production deployments, set environment variables according to your hosting provider:

- **Heroku**: Use the Heroku Dashboard or CLI to set config vars
- **Vercel**: Use the Vercel Dashboard or CLI to set environment variables
- **AWS**: Use AWS Parameter Store or Secrets Manager
- **Docker**: Pass environment variables in your docker-compose file or at runtime

## Variable Descriptions

### `DATABASE_URL`

Connection string for your PostgreSQL database. You'll need to:
1. Create a PostgreSQL database
2. Set up a user with appropriate permissions
3. Format the connection string as shown in the template

### OAuth Credentials

For both Google and GitHub:
1. Register your application with the provider
2. Obtain Client ID and Client Secret
3. Configure the correct redirect URIs:
   - Development: `http://localhost:5000/api/auth/{provider}/callback`
   - Production: `https://your-domain.com/api/auth/{provider}/callback`

### `SESSION_SECRET`

A secure random string used to sign session cookies. This should be:
- At least 32 characters long
- Randomly generated
- Kept secret (never commit to version control)

### `APP_URL`

The base URL of your application. This is used to construct callback URLs and other absolute URLs in the application.

## Migrating from Replit Environment

If you're migrating from Replit, you'll need to:

1. Set up a PostgreSQL database (either locally or using a service like Heroku Postgres)
2. Register your application with OAuth providers
3. Create a new `.env` file with the variables above
4. Update your code to use the new environment variables

## Validating Environment Variables

Add validation to ensure all required environment variables are set:

```typescript
// server/config.ts
function validateEnv() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'SESSION_SECRET',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
}

// Call this function early in your application startup
validateEnv();
``` 