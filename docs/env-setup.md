# Environment Setup

To run the application, you need to set up the following environment variables in your `.env` file:

## Required Environment Variables

```
# Database connection
DATABASE_URL=postgres://username:password@hostname:port/database

# Session management
SESSION_SECRET=your_session_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

## Setting Up OAuth Providers

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Configure OAuth consent screen
5. Create OAuth client ID (Web application type)
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://your-production-domain.com/api/auth/google/callback` (production)
7. Note Client ID and Client Secret for environment variables

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details
4. Add authorization callback URL:
   - `http://localhost:5000/api/auth/github/callback` (development)
   - `https://your-production-domain.com/api/auth/github/callback` (production)
5. Note Client ID and Client Secret for environment variables 